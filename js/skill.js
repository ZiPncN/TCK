import { lib, game, get, _status, ui } from "../../../noname.js";
import TCKUtil from "./utils.js"
export const skills = {
  skill: {
    "tck_chang": {
      enable: ["chooseToRespond", "chooseToUse"],
      filter(event, player) {
        return player.countMark("tck_chang") > 0
      },
      filterCard(card) {
        return get.color(card) == "red";
      },
      viewAs: {
        name: "shan",
      },
      viewAsFilter(player) {
        if (!player.countCards("h", { color: "red" })) {
          return false;
        }
      },
      position: "hs",
      prompt: "手上的红色牌可以当闪使用",
    },
    "tck_tiao": {
      trigger: {
        global: "judge",
      },
      filter(event, player) {
        return player.countCards("h", { suit: "club" }) > 0;
      },
      async cost(event, trigger, player) {
        event.result = await player
          .chooseCard(get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，" + get.prompt(event.skill), "h", function (card) {
            if (get.suit(card) != "club") {
              return false;
            }
            const player = _status.event.player;
            const mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
            if (mod2 != "unchanged") {
              return mod2;
            }
            const mod = game.checkMod(card, player, "unchanged", "cardRespondable", player);
            if (mod != "unchanged") {
              return mod;
            }
            return true;
          })
          .set("judging", trigger.player.judging[0])
          .forResult();
      },
      async content(event, trigger, player) {
        await player.respond(event.cards, "highlight", "tck_tiao", "noOrdering");
        player.$gain2(trigger.player.judging[0]);
        await player.gain(trigger.player.judging[0]);
        trigger.player.judging[0] = event.cards[0];
        trigger.orderingCards.addArray(event.cards);
        game.log(trigger.player, "的判定牌改为", event.cards[0]);
        await game.delay(2);
      },
    },
    "tck_rap": {
      forced: true,
      trigger: {
        global: "gameStart"
      },
      async content(event, trigger, player) {
        await player.draw(2)
      }
    },
    "tck_lan_qiu": {
      trigger: {
        player: ["chooseToUseBegin", "chooseToRespondBegin"]
      },
      prompt: "是否要使用技能【唱】？",
      forced: true,
      filter(event, player) {
        return event.filterCard(get.autoViewAs({ name: "shan" }, "unsure"), player, event)
      },
      async content(event, trigger, player) {
        let res = await player.judge(function (card) {
          if (card.suit == "club") {
            return -1;
          } else {
            return 1;
          }
        }).forResult();
        if (res.suit != "club") {
          await player.addMark("tck_chang")
        } else await player.clearMark("tck_chang")
      },
    },
    "tck_ji_qi_shi": {
      mod: {
        globalFrom(from, to, distance) {
          return distance - 1;
        }
      }
    },
    "tck_ji_qian_feng": {
      init(player) {
        player.storage.tck_ji_qian_feng = 3
      },
      mark: true,
      intro: {
        name: "鷄前锋",
        content: "剩余可加#层"
      },
      trigger: {
        player: "drawEnd"
      },
      forced: true,
      filter(event, player) {
        return event.result.some(card => get.number(card) >= 10 && get.color(card) == "black")
          && player.storage.tck_ji_qian_feng > 0
      },
      async content(event, trigger, player) {
        await player.gainMaxHp(1)
        player.storage.tck_ji_qian_feng--
      }
    },
    "tck_qiu_chang_ji_qing": {
      enable: ["phaseUse"],
      filterTarget(card, player, target) {
        return player != target && !target.isTurnedOver()
      },
      async content(event, trigger, player) {
        await player.loseMaxHp(1)
        await event.target.turnOver()
      }
    },
    "tck_hj_tian_rou": {
      enable: ["phaseUse"],
      filter(event, player) {
        return player.countCards("he") >= 2 && player.isDamaged()
      },
      filterCard: true,
      selectCard: [2, 2],
      position: "he",
      async content(event, trigger, player) {
        await player.recover(1)
      },
    },
    "tck_hj_kuang_gu": {
      trigger: { source: "damageBegin" },
      async content(event, trigger, player) {
        trigger.num = 1
        while (true) {
          let result = await player
            .chooseButton([
              get.prompt(event.name),
              [[["选项①", "再发动一次本技能"], ["选项②", "回复一点体力并扣一点体力"]], "textbutton",]
            ], true)
            .forResult();
          if (result.bool) {
            if (result.links[0] == "选项①") continue
            if (result.links[0] == "选项②") break
          }
        }
        await player.recover(1)
        await player.loseHp(1)
      }
    },
    "tck_hj_jiang_chi": {
      enable: ["phaseUse"],
      async content(event, trigger, player) {
        await game.delay(1)
        await player.chat(`${get.translation(player)}摸了摸牌`)
        await game.delay(2)
      }
    },
    "tck_zhu_shi": {
      intro: {
        name: "眨眼",
        content: "当前有#个“眨眼”标记"
      },
      trigger: {
        global: ["useCard0"]
      },
      filter(event, player) {
        return get.name(event.card) == 'shan' && event.player != player
      },
      async content(event, trigger, player) {
        let res = await player.judge(function (card) {
          if (card.suit == "heart") {
            return -1;
          } else {
            return 1;
          }
        }).forResult();
        if (res.suit != "heart") {
          await trigger.player.addMark("tck_zhu_shi", 1);
        }
      }
    },
    "tck_ning_bo": {
      forced: true,
      trigger: {
        global: ["useCard2"]
      },
      filter(event, player) {
        return get.name(event.card) == 'shan' && event.player != player && event.player.countMark("tck_zhu_shi") >= 4
      },
      async content(event, trigger, player) {
        await trigger.player.loseHp(trigger.player.hp);
        await trigger.player.clearMark("tck_zhu_shi")
      }
    },
    "tck_ji_ta": {
      init(player) {
        player.storage.tck_ji_ta = 0
      },
      mark: true,
      intro: {
        name: "音乐",
        content: "当前有#层“音乐”标记"
      },
      forced: true,
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        await player.addMark("tck_ji_ta", 1)
      },
      group: ["tck_ji_ta_1"],
      subSkill: {
        "1": {
          enable: "phaseUse",
          filter(event, player) {
            return player.countMark("tck_ji_ta") >= 2
          },
          filterTarget(card, player, target) {
            return target != player
          },
          async content(event, trigger, player) {
            await player.removeMark("tck_ji_ta", 2)
            await event.target.loseHp(1)
            await player.recover(1)
          }
        }
      }
    },
    "tck_ge_sheng_wai_fang": {
      //当你成为牌的目标时
      trigger: {
        target: "useCardToTarget"
      },
      filter(event, player) {
        return (get.type(event.card) == "trick" || get.type(event.card) == "delay") && player.countMark("tck_ji_ta") >= 8
      },
      async content(event, trigger, player) {
        await trigger.excluded.add(player);
      },
    },
    "tck_pa_si": {
      trigger: {
        global: "phaseZhunbei"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await player.judge((card) => 1).forResult()
        switch (res.suit) {
          case "heart": //八卦阵
            await player.addTempSkill("tck_pa_si_bagua", { global: "phaseJieshu" });
            break;
          case "diamond":   //仁王盾
            await player.addTempSkill("tck_pa_si_renwang", { global: "phaseJieshu" });
            break;
          case "club":    //白银狮子
            await player.addTempSkill("tck_pa_si_baiyin", { global: "phaseJieshu" });
            break;
          case "spade":   //藤甲
            await player.addTempSkill("tck_pa_si_tengjia1", { global: "phaseJieshu" });
            await player.addTempSkill("tck_pa_si_tengjia2", { global: "phaseJieshu" });
            await player.addTempSkill("tck_pa_si_tengjia3", { global: "phaseJieshu" });
            break;
        }
      },
      subSkill: {
        "bagua": {
          mark: true,
          intro: {
            content: '当前视为携带八卦阵'
          },
          equipSkill: true,
          inherit: "bagua_skill",
          filter(event, player) {
            if (!lib.skill.bagua_skill.filter(event, player)) {
              return false;
            }
            return true;
          }
        },
        "renwang": {
          mark: true,
          intro: {
            content: '当前视为携带仁王盾'
          },
          equipSkill: true,
          inherit: "renwang_skill",
          filter(event, player) {
            if (!lib.skill.renwang_skill.filter(event, player)) {
              return false;
            }
            return true;
          }
        },
        "baiyin": {
          mark: true,
          intro: {
            content: '当前视为携带白银狮子'
          },
          equipSkill: true,
          inherit: "baiyin_skill",
          filter(event, player) {
            if (!lib.skill.baiyin_skill.filter(event, player)) {
              return false;
            }
            return true;
          }
        },
        "tengjia1": {
          mark: true,
          intro: {
            content: '当前视为携带藤甲'
          },
          equipSkill: true,
          inherit: "tengjia1",
          filter(event, player) {
            if (!lib.skill.tengjia1.filter(event, player)) {
              return false;
            }
            return true;
          }
        },
        "tengjia2": {
          equipSkill: true,
          inherit: "tengjia2",
          filter(event, player) {
            if (!lib.skill.tengjia2.filter(event, player)) {
              return false;
            }
            return true;
          }
        },
        "tengjia3": {
          equipSkill: true,
          inherit: "tengjia3",
          filter(event, player) {
            if (!lib.skill.tengjia3.filter(event, player)) {
              return false;
            }
            return true;
          }
        }
      }
    },
    "tck_lao_dong_zui_guang_rong": {
      mod: {
        targetEnabled(card, player, target, now) {
          if (card.name == "tck_shi" || card.name == "lebu") {
            return false;
          }
        },
      },
    },
    "tck_bu_lao_er_huo": {
      forced: true,
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        await player.draw(2)
      }
    },
    "tck_bu_zhi_hao_dai": {
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return num + 2;
          }
        },
      }
    },
    "tck_lao_dong_zhi_xing": {
      //出牌阶段可用
      enable: ["phaseUse"],
      async content(event, trigger, player) {
        await player.loseHp(1)
        let cards = []
        while (true) {
          let res = await player.judge((card) => {
            if (get.type(card) == "trick" || get.type(card) == "delay") return 0
            return 1
          }).forResult()
          if (get.type(res.card) == "trick" || get.type(res.card) == "delay") {
            cards.push(res.card)
            break
          }
          cards.push(res.card)
        }
        await player.gain(cards, "gain2")
      },
    },
    "tck_gou_yan_can_chuan": {
      unique: true, // 独有技能
      skillAnimation: true, // 播放技能动画
      limited: true, // 限定技
      trigger: {
        player: "dying"
      },
      filter(event, player) {
        if (player.storage.tck_gou_yan_can_chuan) return false; // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        let loseMaxHpNum = player.maxHp - 1
        await player.loseMaxHp(loseMaxHpNum)
        let recordNum = 1 - player.hp
        if (recordNum <= 0) recordNum = 1
        await player.recover(recordNum)
        player.storage.tck_gou_yan_can_chuan = true //标记已经用过了
      },
    },
    "tck_pin_min": {
      forced: true,
      trigger: {
        global: "phaseDrawEnd"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await trigger.player.chooseToGive(player, 1, "he").forResult()
        if (!res.bool) {
          await trigger.player.loseHp(1)
        }
      },
    },
    "tck_ai_xin": {
      trigger: {
        global: "dying"
      },
      //红色手牌数大于1
      filter(event, player) {
        return player.countCards("h", card => get.color(card) == "red") > 0
      },
      async content(event, trigger, player) {
        let res = await player.chooseCard("h", true, 1, card => get.color(card) == "red").set('prompt', '请弃置一张红色手牌').forResult()
        await player.discard(res.cards)
        let recoverNum = 1 - trigger.player.hp
        await trigger.player.recover(recoverNum)
      },

    },
    "tck_mei_gui": {
      init(player) {
        player.hp = -1
      },
      mark: true,
      intro: {
        name: "玫瑰",
        content: "当前有#个玫瑰标记"
      },
      group: ["tck_mei_gui_init", "tck_mei_gui_lose", "tck_mei_gui_gain", "tck_mei_gui_die", "tck_mei_gui_maxHp"],
      subSkill: {
        "init": {
          trigger: {
            global: "gameStart",
          },
          forced: true,
          async content(event, trigger, player) {
            await player.addMark("tck_mei_gui", 5)
          }
        },
        "lose": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: "damageBegin"
          },
          async content(event, trigger, player) {
            trigger.num = 0
            await player.removeMark("tck_mei_gui", 1)
            if (player.countMark("tck_mei_gui") == 0) {
              await player.dying()
            }
          }
        },
        "gain": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: "recoverBegin"
          },
          async content(event, trigger, player) {
            let gainMarkNum = trigger.num
            let markNum = player.countMark("tck_mei_gui")
            if (markNum + gainMarkNum > 5) gainMarkNum = 5 - markNum
            if (gainMarkNum < 0) gainMarkNum = 0
            trigger.num = 0
            if (gainMarkNum > 0) {
              await player.addMark("tck_mei_gui", gainMarkNum)
            }
          }
        },
        "die": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: "dyingBegin"
          },
          filter(event, player) {
            return player.countMark("tck_mei_gui") > 0
          },
          async content(event, trigger, player) {
            await trigger.cancel()
          }
        },
        "maxHp": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: ["gainMaxHpBegin", "loseMaxHpBegin"]
          },
          async content(event, trigger, player) {
            await trigger.cancel()
          }
        }
      }
    },
    "tck_xiao_hai": {
      mod: {
        //手牌上限视为4
        maxHandcard(player, num) {
          return 5;
        },
        targetEnabled(card, player, target, now) {
          if (card.name == "sha" && target.inRange(player)) {
            return false;
          }
        },
      }
    },
    "tck_gan_shen_me_a_?": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.countCards("he") > 0;
      },
      filterCard: true,
      position: "he",
      viewAs: {
        name: "tck_gu_zhu_yi_zhi",
      },
      async precontent(event, trigger, player) {
        await player.addTempSkill("tck_gan_shen_me_a_?_effect", { player: "phaseJieshuAfter" })
      },
      subSkill: {
        "effect": {
          mark: true,
          marktext: "不",
          intro: {
            name: "不要停下来啊！",
            content: "本回合杀无次数限制"
          },
          sub: true,
          sourceSkill: "tck_gan_shen_me_a_?",
          mod: {
            cardUsable(card, player, num) {
              if (card.name == "sha") {
                return Infinity;
              }
            },
          },
        }
      }
    },
    "tck_bin_si": {
      trigger: {
        player: "phaseJieshuBefore"
      },
      filter(event, player) {
        return player.hasSkill("tck_gu_zhu_yi_zhi_skill")
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == "heart") return 1
          return -1
        }).forResult()
        if (get.suit(res) == "heart") {
          await player.removeSkill("tck_gu_zhu_yi_zhi_skill")
          await player.addTempSkill("tck_gu_zhu_yi_zhi_lite_skill", { player: "phaseJieshuAfter" })
        }
      }
    },
    "tck_xi_wang": {
      trigger: {
        player: "dieBegin"
      },
      //锁定技
      charlotte: true,
      forced: true,
      async content(event, trigger, player) {
        game.switchTCKBgm("tck_xi_wang_zhi_hua:ogg", "TCK");
      }
    },
    "tck_ju_huo": {
      forced: true,
      trigger: {
        player: "damageBegin"
      },
      filter(event, player) {
        return event.nature == "fire"
      },
      async content(event, trigger, player) {
        let result = await player
          .chooseButton([
            '请选择一项',
            [[
              ["选项①", `此伤害+1`],
              ["选项②", `防止此伤害改为减少1点体力上限`],
            ], "textbutton",]
          ], true)
          .forResult();
        if (result.bool) {
          switch (result.links[0]) {
            case '选项①':
              trigger.num += 1
              break;
            case '选项②':
              trigger.num = 0
              await player.loseMaxHp(1)
              break;
          }
        }
      }
    },
    "tck_qi_pian": {
      enable: "phaseUse",
      filter(event, player) {
        return player.countCards("h", card => get.type(card) == "trick" || get.type(card) == "delay") > 0
      },
      selectCard: 1,
      position: "h",
      filterCard(card, player) {
        return get.type(card) == "trick" || get.type(card) == "delay"
      },
      filterTarget: true,
      async content(event, trigger, player) {
        let res = await event.target.chooseCard("hs", card => get.name(card) == "sha").set('prompt', '是否对自己使用一张【杀】？').forResult()
        if (res.bool) {
          //选择使用
          await player.draw(1)
          await event.target.addTempSkill("tck_qi_pian_temp", { global: "tck_qi_pianAfter" })
          await event.target.useCard(res.cards[0], event.target, false)
        } else {
          //没有使用,获得其一张牌
          await player.gainPlayerCard("he", event.target, true)
        }
      },
      group: ["tck_qi_pian_effect"],
      subSkill: {
        "effect": {
          forced: true,
          trigger: {
            global: "damageBegin"
          },
          filter(event, player) {
            return event.player.hasSkill("tck_qi_pian_temp")
          },
          async content(event, trigger, player) {
            let result = await player.chooseControl(["确定", "取消"])
              .set('prompt', '是否防止该伤害？')
              .forResult();
            switch (result.control) {
              case '确定':
                trigger.num = 0
                await player.draw(2)
                break;
              case '取消':
                break;
            }
          }
        }
      },

    },
    "tck_fan_xiang": {
      skillAnimation: true,
      animationColor: "fire",
      juexingji: true,
      derivation: ["xiaoji", "tck_luo_ying"],
      trigger: {
        player: "phaseZhunbeiBegin",
      },
      filter(event, player) {
        return game.hasPlayer(function (current) {
          return current.storage.liangzhu?.includes(player);
        });
      },
      forced: true,
      content() {
        player.awakenSkill(event.name);
        player.changeSkills(["xiaoji", "tck_luo_ying"], ["liangzhu"]);
      },
    },
    "tck_luo_ying": {
      trigger: {
        global: "loseAfter",
      },
      filter(event, player) {
        if (event.type != "discard" || event.getlx === false) {
          return false;
        }
        var cards = event.cards.slice(0);
        var evt = event.getl(player);
        if (evt && evt.cards) {
          cards.removeArray(evt.cards);
        }
        for (var i = 0; i < cards.length; i++) {
          if (cards[i].original != "j" && get.type(cards[i]) == "equip" && get.position(cards[i], true) == "d") {
            return true;
          }
        }
        return false;
      },
      direct: true,
      content() {
        "step 0";
        if (trigger.delay == false) {
          game.delay();
        }
        "step 1";
        var cards = [],
          cards2 = trigger.cards.slice(0),
          evt = trigger.getl(player);
        if (evt && evt.cards) {
          cards2.removeArray(evt.cards);
        }
        for (var i = 0; i < cards2.length; i++) {
          if (cards2[i].original != "j" && get.type(cards2[i]) == "equip" && get.position(cards2[i], true) == "d") {
            cards.push(cards2[i]);
          }
        }
        console.log(cards)
        if (cards.length) {
          player.chooseButton(["落英：选择要获得的牌", cards], [1, cards.length])
        }
        "step 2";
        if (result.bool) {
          player.logSkill(event.name);
          player.gain(result.links, "gain2", "log");
        }
      }
    },
    "tck_diu_shi": {
      init(player) {
        player.storage.tck_diu_shi = null
      },
      mark: true,
      marktext: "丢",
      intro: {
        name: "丢失的数字",
        content(storage, player) {
          if (!storage) {
            return "当前没有丢失的数字"
          }
          return `当前丢失的数字为：${storage}`
        }
      },
      group: ["tck_diu_shi_roundStart", "tck_diu_shi_effect"],
      subSkill: {
        "roundStart": {
          trigger: {
            global: "roundStart"
          },
          async content(event, trigger, player) {
            //1 选择要丢失的数字
            let res = await player
              .chooseNumbers("选择一个数字", [
                {
                  min: 1,
                  max: 13,
                },
              ], true).forResult();
            if (res.bool)
              player.storage.tck_diu_shi = res.numbers[0]
          }
        },
        "effect": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            global: "drawEnd"
          },
          filter(event, player) {
            return event.result.some(card => get.number(card) == player.storage.tck_diu_shi)
          },
          async content(event, trigger, player) {
            let cards = trigger.result.filter(card => get.number(card) == player.storage.tck_diu_shi)
            await trigger.player.discard(cards)
          }
        }
      }
    },
    "tck_ji_lei_0": {
      derivation: ["tck_ji_lei_1", "tck_ji_lei_2", "tck_ji_lei_3"], // 派生技能(显示在技能描述中)
      charlotte: true,
      forced: true,
      trigger: {
        player: "useCard",
      },
      filter(event, player) {
        return get.type(event.card) == "basic"
      },
      async content(event, trigger, player) {
        await player.draw();
      },
    },
    "tck_ji_lei_1": {
      unique: true,
      charlotte: true,
      forced: true,
      trigger: {
        player: "useCard",
      },
      filter(event, player) {
        return get.type(event.card) == "basic" || get.type(event.card) == "equip";
      },
      async content(event, trigger, player) {
        await player.draw();
      },
    },
    "tck_ji_lei_2": {
      unique: true,
      charlotte: true,
      forced: true,
      trigger: {
        player: "useCard",
      },
      filter(event, player) {
        return get.type(event.card) == "basic" || get.type(event.card) == "equip" || get.type(event.card) == "trick" || get.type(event.card) == "delay"
      },
      async content(event, trigger, player) {
        await player.draw();
      },
    },
    "tck_ji_lei_3": {
      unique: true,
      charlotte: true,
      forced: true,
      trigger: {
        player: "useCard",
      },
      filter(event, player) {
        return get.type(event.card) == "basic" || get.type(event.card) == "equip" || get.type(event.card) == "trick" || get.type(event.card) == "delay" || get.type(event.card) == "land"
      },
      async content(event, trigger, player) {
        await player.draw();
      },
    },
    "tck_xue_xi": {
      init(player) {
        player.storage.tck_xue_xi = 3;
      },
      enable: "phaseUse",
      usable: 1,
      position: "h",
      filterCard: true,
      selectCard: -1,
      filter(event, player) {
        return player.countCards("h") > 0;
      },
      async content(event, trigger, player) {
        let oldskill = "tck_ji_lei_" + (3 - player.storage.tck_xue_xi)
        let newskill = "tck_ji_lei_" + (3 - player.storage.tck_xue_xi + 1)
        await player.changeSkills([newskill, "tck_xue_xi"], [oldskill, "tck_xue_xi"])
        if (player.storage.tck_xue_xi > 0) player.storage.tck_xue_xi--
        if (player.storage.tck_xue_xi == 1) await player.loseMaxHp(1)
        if (player.storage.tck_xue_xi == 0) await player.removeSkill("tck_xue_xi")
      }
    },
    "tck_hui_fu": {
      trigger: {
        player: "damageEnd"
      },
      forced: true,
      async content(event, trigger, player) {
        for (let i = 0; i < trigger.num; i++) {
          let cards = await player.draw(3).forResult()
          if (cards.every(card => get.color(card) == get.color(cards[0]))) {
            await player.recover(1)
          }
        }
      }
    },
    "tck_bao_hu": {
      trigger: {
        global: "damageBegin"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await player.chooseCard("he", true, 1).set('prompt', '请弃置一张牌，将伤害转移给你').forResult()
        await player.discard(res.cards)
        let damageNum = trigger.num
        trigger.num = 0
        await player.damage(damageNum, trigger.source)
      }
    },
    "tck_yi_yu": {
      enable: "phaseUse",
      usable: 1,
      filterTarget(card, player, target) {
        return player.canCompare(target);
      },
      filter(event, player) {
        return player.countCards("h") > 0;
      },
      async content(event, trigger, player) {
        let res = await player.chooseToCompare(event.target).forResult();
        if (res.bool) {
          //拼点赢
          let result = await event.target.chooseControl(["失去1点体力上限", "流失1点体力"])
            .forResult();
          switch (result.control) {
            case '失去1点体力上限':
              await event.target.loseMaxHp(1);
              break;
            case '流失1点体力':
              await event.target.loseHp(1);
              break;
          }
        } else {
          //拼点输
          await player.addMark("tck_zi_sha", 1)
          if (player.countMark("tck_zi_sha") >= 12) {
            await game.delay()
            await player.die()
          }
        }
      },
    },
    "tck_zi_sha": {
      init(player) {
        player.storage.tck_zi_sha = 0
      },
      mark: true,
      marktext: "抑",
      intro: {
        name: "抑郁",
        content: "当前有#个“抑”标记"
      },
      mod: {
        cardnumber(card) {
          if (get.suit(card) == "heart") {
            return 13;
          }
        },
      },
    },
    "tck_gao_xiao": {
      unique: true,
      enable: "phaseUse",
      usable: 2,
      filterTarget(card, player, target) {
        return target != player;
      },
      async content(event, trigger, player) {
        let res = await event.target.chooseCard("hs", card => {
          if (event.target.hasSkill("tck_gao_xiao_debuff")) {
            return false
          }
          return get.name(card) == "sha"
        }
        ).set('prompt', `是否对${get.translation(player)}使用一张【杀】？`).forResult()
        if (res.bool) {
          //选择使用
          await event.target.addTempSkill("tck_gao_xiao_effect")
          await event.target.useCard(res.cards[0], player, false)
        } else {
          //没有使用,其流失1点体力
          await event.target.loseHp(1)
        }
      },
      subSkill: {
        "effect": {
          unique: true,
          charlotte: true,
          forced: true,
          trigger: {
            player: "useCardAfter",
          },
          async content(event, trigger, player) {
            if (await player.hasHistory("sourceDamage", evt => evt.card == trigger.card)) {
              //造成了伤害
              const evt = player.getHistory("sourceDamage")[0]
              if (get.color(trigger.card) == "red") {
                await evt.player.recover(1)
              } else if (get.color(trigger.card) == "black", evt => evt.card == trigger.card) {
                //本轮不能对你使用牌
                await player.addTempSkill("tck_gao_xiao_debuff", { global: "roundStart" })
              }
            } else {
              //未造成伤害
              const evt = player.getHistory("useCard")[0]
              console.log(evt.targets[0])
              console.log(evt.player)
              await evt.targets[0].discardPlayerCard(evt.player, "hej", true)
            }
            await player.removeSkill("tck_gao_xiao_effect")
          },
          sub: true,
          sourceSkill: "tck_gao_xiao",
        },
        "debuff": {
          mark: true,
          marktext: "搞",
          intro: {
            name: "搞笑",
            content: "本轮不能对星王子含使用牌"
          },
          unique: true,
          mod: {
            playerEnabled(card, player, target) {
              if (get.translation(target) == "星王子含") {
                return false
              }
            }
          },
        }
      }
    },
    "tck_mi_huo": {
      enable: "phaseUse",
      usable: 1,
      selectCard: 1,
      position: "h",
      filterCard: true,
      filterTarget(card, player, target) {
        return target != player
      },
      filter(event, player) {
        return player.countCards("h") > 0
      },
      async content(event, trigger, player) {
        let result = await event.target.chooseControl(['翻面', '弃置所有手牌'])
          .forResult();
        switch (result.control) {
          case '翻面':
            await event.target.turnOver()
            break;
          case '弃置所有手牌':
            await event.target.discard(event.target.getCards('h'), true)
            break;
        }
      }
    },
    "tck_xi_shou": {
      trigger: {
        player: "phaseJieshu"
      },
      filter(event, trigger, player) {
        return game.players.some(player => player.isTurnedOver())
      },
      async content(event, trigger, player) {
        let res = await player.chooseTarget((caed, player, target) => target.isTurnedOver(), 1, true).forResult()
        let target = res.targets[0]
        await target.loseHp(1)
        await target.draw(2)
        await player.gainMaxHp(1)
        await player.recover(1)
      }
    },
    "tck_ji_xian_huo_hua": {
      enable: ["chooseToUse"],
      filterCard(card) {
        return get.color(card) == "red";
      },
      viewAs: {
        name: "sha",
      },
      viewAsFilter(player) {
        if (!player.countCards("h", { color: "red" })) {
          return false;
        }
      },
      position: "h",
      prompt: "手上红牌都可以当杀使用",
    },
    "tck_fei_zhi_xiang_xing_guang_xian": {
      enable: ["chooseToUse", "chooseToRespond"],
      filterCard(card) {
        return get.color(card) == "black";
      },
      viewAs: {
        name: "shan",
      },
      viewAsFilter(player) {
        if (!player.countCards("h", { color: "black" })) {
          return false;
        }
      },
      position: "h",
      prompt: "手上黑牌都可以当闪",
    },
    "tck_wu_yu": {
      forced: true,
      trigger: {
        source: "damageBegin",
      },
      filter(event, player) {
        return get.name(event.card) == "sha" && event.nature == "fire" || event.nature == "thunder"
      },
      async content(event, trigger, player) {
        if (trigger.nature == "fire") {
          trigger.num = 0
        } else if (trigger.nature == "thunder") {
          trigger.num *= 2

        }
      }
    },
    "tck_xie_sheng": {
      enable: ["chooseToUse", "chooseToRespond"],
      filterCard(card) {
        return get.type(card) == "trick" || get.type(card) == "delay";
      },
      viewAs: {
        name: "tao",
      },
      viewAsFilter(player) {
        if (!player.countCards("h", card => get.type(card) == "trick" || get.type(card) == "delay")) {
          return false;
        }
      },
      position: "h",
      prompt: "手上一张锦囊变为桃",
      mod: {
        //手牌上限+3
        maxHandcard(player, num) {
          return num + 3;
        }
      }
    },
    "tck_hui_meng": {
      init(player) {
        player.storage.tck_hui_meng = 0
      },
      mark: true,
      marktext: "绘",
      intro: {
        name: "绘梦",
        content: "当前已连用#回合"
      },
      forced: true,
      trigger: {
        player: "phaseJieshu"
      },
      filter(event, player) {
        const history = player.getHistory("useCard").concat(player.getHistory("respond"));
        if (history.length > 0) {
          player.storage.tck_hui_meng = 0
          return false
        }
        return true
      },
      async content(event, trigger, player) {
        let result = await player.chooseControl(["确定", "取消"])
          .set('prompt', '是否发动【绘梦】？')
          .forResult();
        switch (result.control) {
          case '确定':
            player.storage.tck_hui_meng += 1
            if (player.storage.tck_hui_meng >= 3) await player.loseHp(player.hp)
            player.addTempSkill("tck_hui_meng_effect", { player: "phaseZhunbei" })
            break;
          case '取消':
            player.storage.tck_hui_meng = 0
            break;
        }

      },
      subSkill: {
        "effect": {
          mark: true,
          marktext: "无",
          intro: {
            name: "无敌",
            content: "当前处于无敌状态"
          },
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: ["damageBegin", "loseHpBegin"]
          },
          async content(event, trigger, player) {
            await trigger.cancel()
          }
        }
      }
    },
    "tck_bian_shen": {
      skillAnimation: true, // 播放技能动画
      derivation: ["tck_qi_shi"], // 派生技能(显示在技能描述中)
      unique: true, // 独有技能
      limited: true, // 限定技
      filter(event, player) {
        if (player.storage.tck_bian_shen) return false; // 已使用过则不能发动
        return true
      },
      trigger: {
        player: "dying"
      },
      async content(event, trigger, player) {
        player.maxHp = 4
        let recoverNum = 4 - player.hp
        await player.recover(recoverNum)
        await player.changeSkills(["tck_bian_shen", "tck_qi_shi"], ["tck_xie_sheng", "tck_hui_meng", "tck_bian_shen"])
        player.storage.tck_bian_shen = true //标记已经用过了
      },
    },
    "tck_qi_shi": {
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return Infinity;
          }
        },
      },
    },
    "tck_xun_huan": {
      trigger: { player: "useCardAfter" },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == "heart" || get.suit(card) == "club") return 1
          return -1
        }).forResult();
        if (get.suit(res) == "heart" || get.suit(res) == "club") {
          //再结算一次
          await player.useCard(trigger.card, trigger.stocktargets)
        }
      }
    },
    "tck_lun_hui": {
      trigger: {
        target: "useCardToTarget"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == "diamond" || get.suit(card) == "spade") return 1
          return -1
        }).forResult();
        if (get.suit(res) == "diamond" || get.suit(res) == "spade") {
          //将牌的目标改为来源
          const target = trigger.player;
          const evt = trigger.getParent();
          evt.triggeredTargets2.remove(player);
          evt.targets = [];
          evt.targets.push(target);
        }
      }

    },
    "tck_fei_sha": {
      enable: "phaseUse",
      filterTarget(card, player, target) {
        return target != player && target.countCards("hej") > 0;
      },
      async content(event, trigger, player) {
        let res = await player.choosePlayerCard([1, 3], event.target, "hej", true).forResult()
        await game.delay(1)
        await player.chat(`${get.translation(player)}选择了${get.translation(event.target)}的${res.cards.length}张牌`)
        await game.delay(2)
      }
    },
    "tck_gu": {
      trigger: {
        player: "phaseDiscardBefore",
      },
      charlotte: true,
      forced: true,
      async content(event, trigger, player) {
        await trigger.cancel();
      },
    },
    "tck_wai_zui": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.countCards('h') > 0;
      },
      filterTarget(card, player, target) {
        return player.canCompare(target);
      },
      async content(event, trigger, player) {
        let res = await player.chooseToCompare(event.target).forResult();
        if (res.bool) {
          //拼点赢
          await player.draw(2)
        } else {
          //拼点输
          await event.target.gainPlayerCard("h", player, true).set("target", player)
        }
      },
      mod: {
        //手牌上限+2
        maxHandcard(player, num) {
          return num + 2;
        }
      }
    },
    "tck_kuang_xiao": {
      enable: "phaseUse",
      //有酒才能用
      filter(event, player) {
        return player.countCards("h", card => get.name(card) == "jiu") > 0
      },
      selectCard: 1,
      filterCard(card) {
        return get.name(card) == "jiu"
      },
      position: "h",
      async content(event, trigger, player) {
        await player.discard(event.card)
        await player.recover(1)
        await player.addTempSkill("tck_kuang_xiao_effect", { player: "phaseJieshuAfter" })
        await player.addTempSkill("tck_kuang_xiao_2", { player: "phaseJieshuAfter" })
      },
      subSkill: {
        "effect": {
          sub: true,
          sourceSkill: "tck_kuang_xiao",
          mark: true,
          marktext: "狂",
          intro: {
            name: "狂啸",
            content: "此回合杀的伤害+2，决斗对手不可使用杀或无懈"
          },
          charlotte: true,
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            return get.name(event.card) == "sha"
          },
          async content(event, trigger, player) {
            trigger.num += 2
          }

        },
        "2": {
          sub: true,
          sourceSkill: "tck_kuang_xiao",
          charlotte: true,
          forced: true,
          trigger: {
            player: "useCard"
          },
          filter(event, player) {
            return get.name(event.card) == "juedou"
          },
          async content(event, trigger, player) {
            await trigger.directHit.addArray(game.players);
          }
        },
      }
    },
    "tck_gao_guai": {
      trigger: {
        player: "phaseZhunbei"
      },
      async cost(event, trigger, player) {
        const { result } = await player.chooseTarget(
          get.prompt(event.skill),
          "从至多2名角色区域各获得1张牌",
          [1, 2],
          (card, player, target) => {
            return target.countCards("hej") > 0 && player != target;
          }
        )
        event.result = result;
      },
      async content(event, trigger, player) {
        await player.gainMultiple(event.targets, "hej");
        await game.delay();
      }
    },
    "tck_yu_yue": {
      enable: ["chooseToUse"],
      viewAs: {
        name: "tao"
      },
      viewAsFilter(player) {
        return player.countCards("he", card => get.color(card) == "red") > 0
      },
      filterCard(card) {
        return get.color(card) == "red";
      },
      selectCard: 1,
      position: "he",
    },
    "tck_shen_wei_mu": {
      group: ["tck_shen_weimu_1", "tck_shen_weimu_2"],
      subSkill: {
        "1": {
          sub: true,
          sourceSkill: "tck_shen_weimu",
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            player: "useCard"
          },
          filter(event, player) {
            return get.type(event.card) == 'trick' || get.type(event.card) == 'delay';
          },
          async content(event, trigger, player) {
            await trigger.directHit.addArray(game.players);
          },
        },
        "2": {
          sub: true,
          sourceSkill: "tck_shen_weimu",
          trigger: {
            global: "useCard1",
          },
          charlotte: true,
          forced: true,
          firstDo: true,
          filter(event, player) {
            if (event.player == player) {
              return false;
            }
            if (get.color(event.card) != "black" || get.type(event.card) != "trick") {
              return false;
            }
            var info = lib.card[event.card.name];
            return info && info.selectTarget && info.selectTarget == -1 && !info.toself;
          },
          mod: {
            targetEnabled(card, player, target) {
              if (player == target) return true;
              if ((get.type(card) == "trick" || get.type(card) == "delay") && get.color(card) == "black") {
                return false;
              }
            },
          }
        },
      },
    },
    "tck_shen_jue_sha": {
      enable: "phaseUse",
      usable: 1,
      position: "he",
      chooseCard: 1,
      filterCard(card) {
        return get.color(card) == 'black'
      },
      filterTarget: true,
      async content(event, trigger, player) {
        const targetCards = event.target.getCards("h")
        await event.target.discard(event.target, targetCards, true)
        await event.target.draw(targetCards.length)
        await event.target.showCards(await event.target.getCards("h"))
        const targetCards2 = event.target.getCards("h", card => get.type(card) != 'basic')
        await event.target.discard(event.target, targetCards2, true)
        await event.target.damage(targetCards2.length)
      }
    },
    "tck_chao_feng": {
      forced: true,
      trigger: {
        player: "phaseZhunbei"
      },
      filter(event, player) {
        // 先判断弃牌堆是否有
        const discardCard = get.discardPile("tck_bai_niao_chao_feng_qiang")
        if (discardCard) {
          return true
        }
        // 再判断场上是否有
        let players = game.players.filter(p => p.hasCard("tck_bai_niao_chao_feng_qiang", "ej"))
        if (players.length > 0) {
          return true
        }
        return false
      },
      async content(event, trigger, player) {
        let card = get.discardPile("tck_bai_niao_chao_feng_qiang")
        if (!card) {
          let players = game.players.filter(p => p.hasCard("tck_bai_niao_chao_feng_qiang", "ej"))
          for (const p of players) {
            const cards = p.getCards("ej", (card) => get.name(card) == "tck_bai_niao_chao_feng_qiang")
            if (cards.length > 0) {
              card = cards[0]
              break
            }
          }
        }
        if (card) {
          await player.chooseUseTarget(card, "nopopup")
        }

      }
    },
    "tck_chuan_cheng": {
      skillAnimation: true,
      juexingji: true,
      derivation: ["longdan", "drlt_xiongluan"],
      unique: true,
      trigger: {
        player: "dying"
      },
      forced: true,
      // 技能效果
      async content(event, trigger, player) {
        await player.awakenSkill(event.name)
        await player.recover(1)
        await player.loseMaxHp(1)
        await player.draw(2)
        // 然后选择一名角色其获得技能 "龙胆", "雄乱"
        let res = await player.chooseTarget("请选择一名角色，其获得技能“龙胆”，“雄乱”", 1).forResult()
        if (res.bool) {
          await res.targets[0].addSkills(["longdan", "drlt_xiongluan"])
        }
      }
    },
    "tck_li_huo": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return game.hasPlayer(target => player.canUse("sha", target, false, false))
      },
      async content(event, trigger, player) {
        const card = await game.createCard({ name: "sha", nature: "fire" })
        await player.chooseUseTarget(card, "nodistance", true, false)
      }
    },
    "tck_huo_zhao": {
      forced: true,
      trigger: {
        player: "damageBegin1"
      },
      filter(event, player) {
        return event.hasNature("fire") || event.hasNature("ice")
      },
      async content(event, trigger, player) {
        await trigger.cancel()
      }
    },
    "tck_huo_ze": {
      trigger: {
        player: "damageBegin2"
      },
      filter(event, player) {
        if (event.card)
          return get.name(event.card) == 'sha'
        return false
      },
      async content(event, trigger, player) {
        let res = await player.judge((card) => {
          if (get.color(card) == 'red') return 1
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          await trigger.cancel()
          trigger.source.addTempSkill("qinggang2", { player: "phaseJieshu" });
          trigger.source.storage.qinggang2.add(trigger.card);
          trigger.source.markSkill("qinggang2");
        }
      }
    },
    "tck_yu_huo": {
      init(player) {
        player.storage.tck_yu_huo = false
        player.storage.tck_yu_huo_count = 0
      },
      unique: true,
      mark: true,
      limited: true,
      skillAnimation: true,
      derivation: ["tck_lian_ji"],
      trigger: {
        player: "dying"
      },
      filter(event, player) {
        if (player.storage.tck_yu_huo) return false
        return true
      },
      async content(event, trigger, player) {
        // await player.awakenSkill("tck_yu_huo")
        player.maxHp = 3
        await player.recover(3 - player.hp)
        await player.removeSkill(["tck_li_huo", "tck_huo_ze"])
        await player.addSkills(["tck_lian_ji"])
        player.storage.tck_yu_huo = true
      },
      group: ["tck_yu_huo_addCount", "tck_yu_huo_removeSkill"],
      subSkill: {
        "addCount": {
          charlotte: true,
          forced: true,
          trigger: {
            player: "phaseJieshu"
          },
          filter(event, player) {
            return player.hasSkill("tck_lian_ji")
          },
          async content(event, trigger, player) {
            player.storage.tck_yu_huo_count++
          }
        },
        "removeSkill": {
          charlotte: true,
          forced: true,
          trigger: {
            player: "phaseJieshuAfter"
          },
          filter(event, player) {
            return player.storage.tck_yu_huo_count == 10
          },
          async content(event, trigger, player) {
            player.maxHp = 4
            await player.removeSkill("tck_lian_ji")
            await player.addSkills(["tck_li_huo", "tck_huo_ze"])
            await player.awakenSkill("tck_yu_huo")
          }
        }
      }

    },
    "tck_lian_ji": {
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        let livePlyaerNum = game.players.filter(p => p.isAlive()).length
        let options = [
          ["all", `对全部人使用火杀`],
          ["single", `单独对一个人使用${livePlyaerNum}张火杀`],
        ];
        let result = await player
          .chooseButton([
            "请选择一项",
            [options, "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          let card = game.createCard({ name: 'sha', nature: 'fire' })
          switch (result.links[0]) {
            case 'all':
              game.players.forEach(p => {
                player.useCard(card, p)
              })
              break;
            case 'single':
              let targetRes = await player.chooseTarget(1, (card, target, player) => target != player).forResult()
              let target = targetRes.targets[0]
              for (let i = 0; i < livePlyaerNum; i++) {
                await player.useCard(card, target)
              }
              break;
            default:
              break;
          }
        }
      }
    },
    "tck_di_1_zha_dan": {
      enable: ["chooseToRespond", "chooseToUse"],
      filterCard: true,
      position: "h",
      viewAs: { name: "sha", nature: "fire" },
      viewAsFilter(player) {
        if (!player.countCards("h")) {
          return false;
        }
      },
      prompt: "手牌可以当火杀"
    },
    "tck_chuan_xin_gong_ji": {
      mod: {
        targetInRange(card, player) {
          if (card.name == "sha") {
            return true;
          }
        },
      }
    },
    "tck_bai_zhe_shi_shen": {
      trigger: {
        player: "damageBegin"
      },
      filter(event, player) {
        let card = event.card
        if (card) {
          return get.name(card) == 'sha'
        }
        return false
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == 'heart') {
            return 1
          }
          return -1
        }).forResult()
        if (get.suit(res) == 'heart') {
          await trigger.cancel()
          await player.recover(1)
        }
      }
    },
    "tck_ma_shu": {
      mod: {
        globalTo(from, to, distance) {
          return distance + 1;
        },
      },
    },
    "tck_ya_1": {
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return num + 1
          }
        },
      },
    },
    "tck_ya_2": {
      trigger: { player: "useCardToPlayered" },
      forced: true,
      filter(event, player) {
        return event.card.name == "sha" && !event.getParent().directHit.includes(event.target);
      },
      logTarget: "target",
      async content(event, trigger, player) {
        const id = trigger.target.playerid;
        const map = trigger.getParent().customArgs;
        if (!map[id]) {
          map[id] = {};
        }
        if (typeof map[id].shanRequired == "number") {
          map[id].shanRequired++;
        } else {
          map[id].shanRequired = 2;
        }
      }
    },
    "tck_ya_3": {
      enable: "phaseUse",
      filterCard: true,
      position: "h",
      filter(event, player) {
        return player.countCards("h") > 0 && player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.recover()
      },
      group: ["tck_ya_3_dying"],
      subSkill: {
        "dying": {
          forced: true,
          trigger: {
            player: "dying"
          },
          filter(event, player) {
            return player.countCards("h") > 0 && player.isDamaged()
          },
          async content(event, trigger, player) {
            while (player.isDying()) {
              if (!(player.countCards("h") > 0)) {
                break
              }
              let res = await player.chooseCard("将黄金回旋打入体内，丢一张手卡回1滴血。", "h", 1).forResult()
              if (!res.bool) {
                break
              }
              await player.discard(res.cards)
              await player.recover()
            }
          }
        }
      }
    },
    "tck_ya_4": {
      init(player) {
        player.storage.tck_ya_4_used = []
      },
      usable: 1,
      trigger: {
        player: "dying"
      },
      filter(event, player) {
        let source = event.source
        if (source) {
          return !player.storage.tck_ya_4_used.some(p => p == source)
        }
        return false
      },
      async content(event, trigger, player) {
        let source = trigger.source
        await player.recover(1)
        await source.addSkill("tck_ya_4_effect")
        await source.damage(player, 2)
        player.storage.tck_ya_4_used.push(source)

      },
      subSkill: {
        "effect": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          sub: true,
          sourceSkill: "tck_ya_4",
          mark: true,
          intro: {
            name: "牙4",
            content: "无法回复生命效果"
          },
          trigger: {
            player: "recoverBegin"
          },
          async content(event, trigger, player) {
            trigger.cancel()
          }
        }
      }

    },
    "tck_ba_ling": {
      enable: "phaseUse",
      usable: 1,
      filterTarget: true,
      async content(event, trigger, player) {
        let target = event.target
        let otherPlayers = game.players.filter(p => p != player && p != target)
        if (otherPlayers.length <= 0) {
          await game.delay(1)
          await player.chat("没有其他角色，霸凌失败")
          await game.delay(2)
          return
        }
        let options = [
          ["draw", `令${get.translation(player.name)}摸1张牌`],
          ["sha", `视为对${get.translation(target.name)}使用1张杀`],
        ]
        let card = game.createCard({ name: 'sha' })
        for (let p of otherPlayers) {
          let result = await p
            .chooseButton([
              "请选择一项",
              [options, "textbutton"]
            ], true)
            .forResult()
          if (result.bool) {
            switch (result.links[0]) {
              case 'draw':
                await player.draw(1)
                break;
              case 'sha':
                await p.useCard(card, target)
                break;
              default:
                break;
            }
          }
        }
      }
    },
    "tck_dou_wu": {
      enable: "phaseUse",
      filterTarget(card, player, target) {
        return player.canCompare(target)
      },
      filter(event, player) {
        return player.countCards("h") > 0 && game.players.some(p => player.canCompare(p))
      },
      async content(event, trigger, player) {
        let target = event.target
        let res = await player.chooseToCompare(target).forResult()
        if (res.tie) return
        if (res.winner == player) {
          await player.gainPlayerCard("hej", target, true)
        } else {
          await target.gainPlayerCard("hej", player, true)
        }
      },
      group: ["tck_dou_wu_add"],
      subSkill: {
        "add": {
          trigger: {
            global: "compare",
          },
          forced: true,
          popup: false,
          filter(event, player) {
            return event.num1 < 13 || event.num2 < 13
          },
          async content(event, trigger, player) {
            console.log(trigger)
            game.log(player, "的拼点牌点数+", 3)
            if (trigger.player == player) {
              trigger.num1 = Math.min(13, trigger.num1 + 3)
            } else if (trigger.target == player) {
              trigger.num2 = Math.min(13, trigger.num2 + 3)
            }
          },
          sub: true,
          sourceSkill: "tck_dou_wu",
        }
      }
    },
    "tck_suan_ye": {
      forced: true,
      trigger: {
        player: "shaHit"
      },
      filter(event, player) {
        let targets = event.targets
        return targets.some(t => !t.hasSkill("tck_suan_ye_shi"))
      },
      async content(event, trigger, player) {
        let noShi = trigger.targets.filter(t => !t.hasSkill("tck_suan_ye_shi"))
        noShi.forEach(t => {
          t.addSkill("tck_suan_ye_shi")
        })
      },
      subSkill: {
        "shi": {
          sub: true,
          sourceSkill: "tck_suan_ye",
          intro: {
            name: "蚀",
          },
          mark: true,
          marktext: "蚀",
          charlotte: true,
          forced: true,
          trigger: {
            player: "phaseZhunbei"
          },
          async content(event, trigger, player) {
            if (player.isDamaged()) {
              await player.loseMaxHp(1)
              await player.removeSkill("tck_suan_ye_shi")
            } else {
              await player.loseHp(1)
            }
          }
        }
      }
    },
    "tck_heng_heng": {
      enable: "chooseToUse",
      filterCard(card) {
        return get.type(card) == "trick" || get.type(card) == "delay"
      },
      position: "h",
      viewAs: { name: "wanjian" },
      viewAsFilter(player) {
        if (!player.countCards("h", card => get.type(card) == "trick" || get.type(card) == "delay")) {
          return false;
        }
      },
      prompt: "将手上的一张锦囊牌当万箭齐发使用"
    },
    "tck_aaa": {
      enable: "chooseToUse",
      filterCard(card) {
        return get.type(card) == "basic";
      },
      position: "h",
      viewAs: { name: "nanman" },
      viewAsFilter(player) {
        if (!player.countCards("h", card => get.type(card) == "basic")) {
          return false;
        }
      },
      prompt: "将手上的一张基本牌当南蛮入侵使用"
    },
    "tck_e_mo": {
      trigger: {
        global: "roundStart"
      },
      async content(event, trigger, player) {
        let res = await player.chooseTarget("请选择一名目标，令其进入地狱", 1, true).forResult()
        if (res.bool) {
          let target = res.targets[0]
          await target.loseHp(target.hp)
        }
      }
    },
    "tck_yi_ji": {
      trigger: { player: "damageEnd" },
      frequent: true,
      filter(event) {
        return event.num > 0;
      },
      getIndex(event, player, triggername) {
        return event.num;
      },
      async content(event, trigger, player) {
        const cards = get.cards(4);
        await game.cardsGotoOrdering(cards);
        if (_status.connectMode) {
          game.broadcastAll(function () {
            _status.noclearcountdown = true;
          });
        }
        event.given_map = {};
        if (!cards.length) {
          return;
        }
        do {
          const { bool, links } =
            cards.length == 1
              ? { links: cards.slice(0), bool: true }
              : await player.chooseCardButton("遗计：请选择要分配的牌", true, cards, [1, cards.length]).set("ai", () => {
                if (ui.selected.buttons.length == 0) {
                  return 1;
                }
                return 0;
              }).forResult();
          if (!bool) {
            return;
          }
          cards.removeArray(links);
          event.togive = links.slice(0);
          const { targets } = await player
            .chooseTarget("选择一名角色获得" + get.translation(links), true)
            .set("ai", target => {
              const att = get.attitude(_status.event.player, target);
              if (_status.event.enemy) {
                return -att;
              } else if (att > 0) {
                return att / (1 + target.countCards("h"));
              } else {
                return att / 100;
              }
            })
            .set("enemy", get.value(event.togive[0], player, "raw") < 0)
            .forResult();
          if (targets.length) {
            const id = targets[0].playerid,
              map = event.given_map;
            if (!map[id]) {
              map[id] = [];
            }
            map[id].addArray(event.togive);
          }
        } while (cards.length > 0);
        if (_status.connectMode) {
          game.broadcastAll(function () {
            delete _status.noclearcountdown;
            game.stopCountChoose();
          });
        }
        const list = [];
        for (const i in event.given_map) {
          const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
          player.line(source, "green");
          if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) {
            player.addExpose(0.2);
          }
          list.push([source, event.given_map[i]]);
        }
        game.loseAsync({
          gain_list: list,
          giver: player,
          animate: "draw",
        }).setContent("gaincardMultiple");
      }
    },
    "tck_tian_du": {
      trigger: { player: "judgeEnd" },
      preHidden: true,
      forced: true,
      frequent(event) {
        //if(get.mode()=='guozhan') return false;
        return event.result.card.name !== "du"
      },
      filter(event, player) {
        return get.position(event.result.card, true) == "o"
      },
      async content(event, trigger, player) {
        await player.gain(trigger.result.card, "gain2")
        await player.draw(1)
      },
    },
    "tck_jin_zhu": {
      mod: {
        globalFrom(from, to, distance) {
          return distance - game.roundNumber
        },
      },
    },
    "tck_wu_zhu": {
      init(player) {
        player.storage.tck_wu_zhu = []
      },
      mark: true,
      intro: {
        content(storage, player) {
          if (player.storage.tck_wu_zhu.length == 0) {
            return "当前没有主"
          }
          return `当前${player.storage.tck_wu_zhu.map(p => get.translation(p)).join('、')}为主`
        }
      },
      charlotte: true,
      forced: true,
      trigger: {
        global: "damageEnd"
      },
      filter(event, player) {
        return event.player != player && player.distanceTo(event.player) == 1
      },
      async content(event, trigger, player) {
        let damageNum = trigger.num
        if (trigger.num) {
          while (damageNum) {
            await player.draw(3)
            damageNum--
          }
        }
      },
    },
    "tck_ju_zhu": {
      charlotte: true,
      forced: true,
      popup: false,
      trigger: {
        global: ["roundStart", "die"]
      },
      async content(event, trigger, player) {
        // 其他所有角色
        const others = game.players.filter(p => p != player)
        // 新主
        const zhus = game.players.filter(p => p != player && player.distanceTo(p) == 1)
        // 旧主
        const oldZhus = player.storage.tck_wu_zhu
        if (TCKUtil.allItemsSame([zhus, oldZhus])) {
          return
        }
        player.storage.tck_wu_zhu = zhus
        if (player.storage.tck_wu_zhu.length == others.length && player.storage.tck_wu_zhu.length >= oldZhus.length) {
          await player.$skill(get.translation(event.name))
          await player.loseMaxHp(2)
        }
      },
    },
    "tck_V_zhi_li": {
      forced: true,
      trigger: {
        source: "damageEnd",
        global: "useCard"
      },
      filter(event, player) {
        if (event.name == 'useCard') {
          return event.card.name == "shan"
        }
        return true
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == "heart" && get.number(card) == 9) {
            return 1
          } return -1
        }).forResult()
        if (get.suit(res) == "heart" && get.number(res) == 9) {
          await game.over(`${get.translation(player)}战斗胜利`)
        }
      },
    },
    "tck_hj_ying_zi": {
      trigger: { player: "phaseDrawBegin" },
      async content(event, trigger, player) {
        trigger.num = 3
        await game.delay(1)
        await player.chat('哈哈哈')
        await game.delay(2)
      },
    },
    "tck_hj_fan_jian": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.countCards('he', card => get.suit(card) == 'diamond') > 0
      },
      async content(event, trigger, player) {
        const res = await player.chooseCard('请选择一张♦牌', 'he', card => get.suit(card) == 'diamond', 1, true).forResult()
        if (!res.bool) {
          return
        }
        const card = res.cards[0]
        const res2 = await player.chooseTarget('请选择一名其他角色，将此牌交给该角色', target => target != player).forResult()
        if (!res2.bool) {
          return
        }
        const target = res2.targets[0]
        player.give(card, target)
      }
    },
    "tck_yin_yang": {
      mark: true,
      locked: false,
      forced: true,
      zhuanhuanji: true, // 标记为转换技
      marktext: "☯", // 显示阴阳标记
      intro: {
        content(storage, player, skill) {
          // 技能描述会根据状态变化
          let str = player.storage.tck_yin_yang ?
            "回合开始，你回复2体力" : // 阳
            "回合开始，你摸4张牌";  // 阴
          return str;
        },
      },
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        if (player.storage.tck_yin_yang == true) {
          // 阳:回复2体力
          await player.recover(2)
        } else {
          // 阴:摸4张牌
          await player.draw(4)
        }
        // 转换技能状态
        player.changeZhuanhuanji("tck_yin_yang");
      },
      group: ["tck_yin_yang_damage"],
      subSkill: {
        "damage": {
          forced: true,
          // charlotte: true,
          trigger: {
            player: "damageBegin"
          },
          filter(event, player) {
            const hp = player.hp
            const maxHp = player.maxHp
            const cardColor = get.color(event.card)
            if (hp == maxHp && cardColor != "red") {
              return true
            }
            if (hp == maxHp - 1 && cardColor != "black") {
              return true
            }
            return false
          },
          async content(event, trigger, player) {
            await trigger.cancel()
          }
        }
      }
    },
    "tck_du_jin": {
      forced: true,
      trigger: {
        player: "phaseDrawBegin"
      },
      async content(event, trigger, player) {
        let equipNum = await player.countCards("e")
        trigger.num += (1 + equipNum)
      },
    },
    "tck_qing_zhou": {
      mod: {
        globalFrom(from, to, distance) {
          return distance - from.countCards("e")
        },
      },
    },
    "tck_ji_jiu": {
      locked: false,
      enable: "chooseToUse",
      viewAsFilter(player) {
        return player != _status.currentPhase && player.countCards("hes", card => get.suit(card) != 'spade') > 0
      },
      filterCard(card) {
        return get.suit(card) != 'spade'
      },
      position: "hes",
      viewAs: { name: "tao" },
      prompt: "将一张非♠牌当桃使用",
    },
    "tck_qing_nang": {
      enable: "phaseUse",
      usable: 1,
      filterCard: 1,
      position: "he",
      filter(event, player) {
        return player.countCards("he") > 0
      },
      async content(event, trigger, player) {
        let res = await player.chooseTarget('请选择至多3名角色', [1, 3], true, (card, player, target) => target.countCards("he") > 0).forResult()
        let targets = res.targets
        for (let target of targets) {
          let res1 = await target.chooseToDiscard("请弃置一张牌，若弃的牌为♠则摸一张牌", "he", true, 1).forResult()
          if (res1.bool) {
            let card = res1.cards[0]
            if (get.suit(card) == 'spade') {
              await target.draw(1)
            }
          }
        }
        let res2 = await player.chooseTarget('请选择一名角色选择一项：<br/>①回复一点体力。②摸2张牌。').forResult()
        if (res2.bool) {
          let target = res2.targets[0]
          let res3 = await target
            .chooseButton([
              '请选择一项',
              [[
                ["recover", `回复一点体力`],
                ["draw", `摸2张牌`],
              ], "textbutton",]
            ], true)
            .forResult();
          if (res3.bool) {
            switch (res3.links[0]) {
              case 'recover':
                await player.recover()
                break;
              case 'draw':
                await player.draw(2)
                break;
            }
          }
        }
      },
    },
    "tck_nian_qing": {
      forced: true,
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        await player.recover()
        await player.draw()
      },
    },
    "tck_3200": {
      mark: true,
      intro: {
        content(storage, player, skill) {
          if (player.storage.tck_3200_record.length > 0)
            return `当前顺序为：${player.storage.tck_3200_record.join("、")}`
          else return "当前无顺序"
        }
      },
      forced: true,
      trigger: { player: "useCard1" },
      filter(event) {
        return get.number(event.card) == 3 || get.number(event.card) == 2
      },
      async content(event, trigger, player) {
        // await player.draw("nodelay")  // 无阻塞摸牌
        await player.draw(1)
      },
      group: ["tck_3200_record", "tck_3200_effect"],
      subSkill: {
        "record": {
          init(player) {
            player.storage.tck_3200_record = []
          },
          forced: true,
          popup: false,
          trigger: {
            player: "useCard0"
          },
          async content(event, trigger, player) {
            let card = trigger.card
            let length = player.storage.tck_3200_record.length
            if (length == 0) {
              if (get.number(card) != 3) {
                return
              }
            }
            if (length == 1) {
              if (get.number(card) != 2) {
                player.storage.tck_3200_record = []
                return
              }
            }
            let number = get.number(card)
            if (number >= 10) number = 0
            player.storage.tck_3200_record.push(number)
          },
        },
        "effect": {
          trigger: {
            player: "useCard2"
          },
          filter(event, player) {
            return player.storage.tck_3200_record.length == 4
          },
          async content(event, trigger, player) {
            await player.chat(`我年纪轻轻工资就达到${player.storage.tck_3200_record.join("")}一个月`)
            await player.draw(4)
            if (player.hasUseTarget({ name: 'sha' }, true, false)) {
              let card = await game.createCard('sha')
              await player.chooseUseTarget(card, false)
            }
            player.storage.tck_3200_record = []
          },
        }
      }
    },
    "tck_chi_ba_ba": {
      enable: "chooseToUse",
      usable: 1,
      filterCard: true,
      position: "he",
      viewAs: { name: "tck_shi" },
      viewAsFilter(player) {
        return player.countCards("he") > 0;
      },
      prompt: "将一张牌当屎使用"
    },
    "tck_jue_zhi_tong": {
      enable: "phaseUse",
      usable: 1,
      filterTarget(card, player, target) {
        return target.countCards("h") > 0 && player != target
      },
      async content(event, trigger, player) {
        await player.viewHandcards(event.target)
      }
    },
    "tck_514": {
      trigger: {
        player: "damageBegin"
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.color(card) == 'red') return 1
          if (get.color(card) == 'black') return -2
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          let source = trigger.source
          if (source) {
            await source.damage(source, trigger.num, trigger.nature)
            await trigger.cancel()
          }
        } else if (get.color(res) == 'black') {
          trigger.num *= 2
        }
      }
    },
    "tck_yao_guai_shao_nv": {
      usable: 2,
      trigger: {
        player: "judge",
      },
      filter(event, player) {
        return player.countCards("h") > 0
      },
      async content(event, trigger, player) {
        let res = await player.chooseToDiscard("请弃置一张手牌", "h", 1, true).forResult()
        if (!res.bool) return
        var card = get.cards()[0]
        event.card = card
        game.cardsGotoOrdering(card).relatedEvent = trigger
        player.$throw(card)
        if (trigger.player.judging[0].clone) {
          trigger.player.judging[0].clone.classList.remove("thrownhighlight")
          game.broadcast(function (card) {
            if (card.clone) {
              card.clone.classList.remove("thrownhighlight")
            }
          }, trigger.player.judging[0])
          game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]))
        }
        game.cardsDiscard(trigger.player.judging[0])
        trigger.player.judging[0] = card
        game.log(trigger.player, "的判定牌改为", card)
        game.delay(2)
      },
    },
    "tck_xia_du": {
      init(player) {
        player.storage.tck_xia_du = null
      },
      mark: true,
      marktext: "下毒",
      intro: {
        name: "下毒",
        content(storage, player) {
          if (!storage) {
            return "当前没有下毒"
          }
          return `当前下毒的花色为：${get.translation(storage)}`
        }
      },
      group: ["tck_xia_du_enable", "tck_xia_du_effect"],
      subSkill: {
        "enable": {
          enable: "phaseUse",
          usable: 1,
          async content(event, trigger, player) {
            let res = await player
              .chooseControl(lib.suit, true)
              .set("prompt", "请选择下毒的花色")
              .forResult()
            if (res.control)
              player.storage.tck_xia_du = res.control
          }
        },
        "effect": {
          //锁定技
          charlotte: true,
          //需（强制使用）
          forced: true,
          trigger: {
            global: "useCardBegin"
          },
          filter(event, player) {
            return get.suit(event.card) == player.storage.tck_xia_du
          },
          async content(event, trigger, player) {
            await trigger.player.loseHp(1)
          }
        }
      }
    },
    "tck_jue_bao": {
      trigger: {
        player: "dieBegin"
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.suit(card) == 'heart' && get.number(card) <= 9 && get.number(card) >= 2) {
            return 1
          } return -1
        }).forResult()
        if (get.suit(res) == 'heart' && get.number(res) <= 9 && get.number(res) >= 2) {
          game.players
            .filter(p => p != player)
            .forEach(p => p.damage(player, 3, 'fire'))
        }
      }
    },
    "tck_zi_you": {
      group: ["tck_zi_you_1", "tck_zi_you_2", "tck_zi_you_3", "tck_zi_you_4", "tck_zi_you_5", "tck_zi_you_6"],
      subSkill: {
        "1": {
          prompt2: "回合开始，你可以多摸1张牌",
          trigger: {
            player: "phaseZhunbei"
          },
          async content(event, trigger, player) {
            await player.draw(1)
          },
        },
        "2": {
          prompt2: "自由",
          prompt: "出牌阶段限1次，你可以从其他玩家摸共2张牌",
          enable: "phaseUse",
          usable: 1,
          async content(event, trigger, player) {
            let res = await player.chooseTarget("请选择任意名目标，摸这些玩家共计至多2张牌", [1, Infinity], true, (card, target, player) => {
              return target != player && target.countCards("h") > 0
            }).forResult()
            if (!res.bool) return
            let targets = res.targets
            let drawNum = 0
            for (let target of targets) {
              if (drawNum == 2) return
              let remainNum = 2 - drawNum
              let res1 = await player.gainPlayerCard(`摸${get.translation(target)}的至多${remainNum}张牌`, target, [1, remainNum], "hej").forResult()
              if (res1.bool) {
                drawNum += res1.cards.length
              }
            }
          },
        },
        "3": {
          mod: {
            judge(player, result) {
              if (_status.event.type == "phase") {
                if (result.bool == false) {
                  result.bool = null
                } else {
                  result.bool = false
                }
              }
            },
          },
        },
        "4": {
          mod: {
            cardUsable(card, player, num) {
              if (card.name == "sha") {
                return num + 1
              }
            },
          }
        },
        "5": {
          mod: {
            maxHandcardBase(player, num) {
              return player.maxHp;
            },
          },
        },
        "6": {
          trigger: { player: "phaseJieshu" },
          forced: true,
          async content(event, trigger, player) {
            await player.draw(1)
          },
        },
      }
    },
    "tck_mi_shen": {
      trigger: { player: "useCardToPlayered" },
      forced: true,
      filter(event, player) {
        return event.card.name == "sha" && !event.getParent().directHit.includes(event.target);
      },
      logTarget: "target",
      async content(event, trigger, player) {
        const id = trigger.target.playerid;
        const map = trigger.getParent().customArgs;
        if (!map[id]) {
          map[id] = {};
        }
        if (typeof map[id].shanRequired == "number") {
          map[id].shanRequired++;
        } else {
          map[id].shanRequired = 2;
        }
      }
    },
    "tck_men_fei": {
      trigger: { player: "useCard" },
      frequent: true,
      preHidden: true,
      filter(event) {
        return ["trick", "delay"].includes(get.type(event.card))
      },
      async content(event, trigger, player) {
        await player.draw(1)
      },
      mod: {
        targetInRange(card, player, target, now) {
          if (["trick", "delay"].includes(get.type(card))) {
            return true;
          }
        },
      },
    },
    "tck_cang": {
      mark: true,
      marktext: "藏",
      intro: {
        // mark(dialog, storage, player) {
        //   dialog.addAuto(
        //     player.getCards("s", function (card) {
        //       return card.hasGaintag("tck_cang");
        //     })
        //   );
        // },
        content(storage, player) {
          const cardNum = player.getCards("s", function (card) {
            return card.hasGaintag("tck_cang");
          }).length
          if (cardNum > 0) {
            return `当前门扉中有${cardNum}张牌`;
          } return "当前门扉中没有牌"
        },
        markcount(storage, player) {
          return player.getCards("s", function (card) {
            return card.hasGaintag("tck_cang");
          }).length;
        },
        onunmark(storage, player) {
          const cards = player.getCards("s", function (card) {
            return card.hasGaintag("tck_cang");
          });
          if (cards.length) {
            player.lose(cards, ui.discardPile);
            player.$throw(cards, 1000);
            game.log(cards, "进入了弃牌堆");
          }
        },
      },
      group: ["tck_cang_discardBegin", "tck_cang_discard", "tck_cang_use"],
      subSkill: {
        "discardBegin": {
          forced: true,
          popup: false,
          trigger: {
            player: "phaseDiscardBegin"
          },
          filter(event, player) {
            return player.getExpansions("tck_cang").length > 0
          },
          async content(event, trigger, player) {
            const cards = await player.getExpansions("tck_cang")
            await player.loseToDiscardpile(cards)
          },
        },
        "discard": {
          forced: true,
          trigger: {
            player: "discardEnd"
          },
          filter(event, player) {
            return event.getParent(2).name == 'phaseDiscard'
          },
          async content(event, trigger, player) {
            // 先移除所有的‘藏’
            const oldCards = player.getCards("s", function (card) {
              return card.hasGaintag("tck_cang");
            })
            if (oldCards.length) {
              await player.loseToDiscardpile(oldCards)
            }
            const cards = trigger.cards
            // 移动到指定的特殊区域
            player.logSkill("tck_cang");
            game.log(player, "将", cards, "进入门扉");
            player.loseToSpecial(cards, "tck_cang").visible = true;
          },
        },
        "use": {
          charlotte: true,
          locked: true,
          mod: {
            cardEnabled2(card, player) {
              if (get.itemtype(card) == "card" && card.hasGaintag("tck_cang")) {
                if (!player.hasSkill("tck_cang")) {
                  return false;
                }
              }
            },
          },
        }
      }
    },

    "tck_dang_xian": {
      forced: true,
      trigger: {
        player: "phaseZhunbeiBefore"
      },
      async content(event, trigger, player) {
        await player.addTempSkill('tck_dang_xian_sha', { player: 'phaseUseEnd' })
        // 加一个额外的出牌阶段
        await player.phaseUse()
      },
      subSkill: {
        "sha": {
          sub: true,
          sourceSkill: "tck_dang_xian",
          enable: "phaseUse",
          usable: 1,
          prompt: "你可以视为使用一张杀",
          filterTarget(card, player, target) {
            return player.canUse({ name: 'sha' }, target, true, true)
          },
          filter(event, player) {
            return player.hasUseTarget({ name: 'sha' }, true, true)
          },
          async content(event, trigger, player) {
            const card = game.createCard('sha')
            await player.useCard(event.target, card)
          }
        }
      }
    },
    "tck_fu_li": {
      unique: true,
      mark: true,
      skillAnimation: true,
      limited: true,
      trigger: {
        player: "dying"
      },
      init(player) {
        player.storage.tck_fu_li = false
      },
      filter(event, player) {
        if (player.storage.tck_fu_li) return false // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_fu_li")
        await player.recover(4 - player.hp)
        let cardNum = await player.countCards("h")
        await player.draw(4 - cardNum)
        // TODO 立即执行你的回合

        player.storage.tck_fu_li = true
      }
    },

    //重制版
    "tck_r_ji_rou": {
      trigger: {
        player: "useCardToPlayered",
      },
      charlotte: true,
      forced: true,
      filter(event, player) {
        return event.card.name == "sha" && !event.getParent().directHit.includes(event.target);
      },
      logTarget: "target",
      async content(event, trigger, player) {
        const id = trigger.target.playerid;
        const map = trigger.getParent().customArgs;
        if (!map[id]) {
          map[id] = {};
        }
        if (typeof map[id].shanRequired == "number") {
          map[id].shanRequired++;
        } else {
          map[id].shanRequired = 2;
        }
      }
    },
    "tck_r_you_huo": {
      trigger: {
        global: "phaseZhunbei"
      },
      forced: true,
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await trigger.player.chooseCard("he", 1, "是否弃置一张牌以抵御诱惑？").forResult()
        if (res.bool) {
          //弃牌了
          await trigger.player.discard(res.cards)
        } else {
          //没弃牌
          await player.addTempSkill("tck_r_you_huo_effect", { global: "phaseJieshuAfter" })
        }
      },
      subSkill: {
        "effect": {
          mark: true,
          marktext: "诱",
          intro: {
            name: "诱惑",
            content: "诱惑成功"
          },
          sub: true,
          sourceSkill: "tck_r_you_huo",
          mod: {
            targetEnabled(card, player, target, now) {
              return false;
            },
          }
        },
      }
    },
    "tck_r_fu_xin": {
      init(player) {
        player.storage.tck_r_fu_xin = player.maxHp
      },
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.storage.tck_r_fu_xin - player.maxHp > 0
      },
      async content(event, trigger, player) {
        let cards = []
        for (let i = 0; i < player.storage.tck_r_fu_xin - player.maxHp; i++) {
          while (true) {
            //判定
            let res = await player.judge(card => {
              if (get.suit(card) == "heart") {
                return 1
              }
              return -1
            }).forResult()

            if (get.suit(res) == "heart") {
              await player.gain(res.card, "gain2")
              game.washCardNoWithDiscard(cards)
              break
            } else {
              cards.push(res.card)
            }
          }
        }
      }
    },
    "tck_r_hua_tian": {
      derivation: ["tck_r_zhong_du"], // 派生技能(显示在技能描述中)
      enable: "phaseUse",
      usable: 1,
      filterTarget(card, player, target) {
        return target.sex == "female"
      },
      async content(event, trigger, player) {
        await player.gainPlayerCard("h", event.target, true, event.target.countCards("h"))
        await player.addSkill("tck_r_zhong_du")
      }
    },
    "tck_r_zhong_du": {
      charlotte: true,
      forced: true,
      trigger: {
        player: "phaseZhunbei"
      },
      async content(event, trigger, player) {
        await player.loseMaxHp(1)
        await player.removeSkill("tck_r_zhong_du")
      }
    },

  },
  translate: {
    "tck_mi_shen": "秘神",
    "tck_mi_shen_info": "你的杀要2张闪。",
    "tck_men_fei": "门扉",
    "tck_men_fei_info": "锦囊无视距离，用了锦囊可以额外摸1张。",
    "tck_cang": "藏",
    "tck_cang_info": "弃牌阶段用，把弃牌进入门扉，下回合可用。",
    "tck_zi_you": "自由",
    "tck_zi_you_info": "回合开始，你可以多摸1张牌，出牌阶段限1次，你可以从其他玩家摸共2张牌，你判定区内的牌反转，你可以多使用1张杀，你的手牌上限视为体力上限。回合结束，你摸1张牌。",
    "tck_xia_du": "下毒",
    "tck_xia_du_info": "出牌阶段限一次，你指定一种花色，每当有人打出这种花色，其就流失一点体力。",
    "tck_jue_bao": "绝爆",
    "tck_jue_bao_info": "当你死亡时判定，若为红桃2-9，则全场受到3点属性伤害，然后结算死亡。",
    "tck_jue_zhi_tong": "觉之瞳",
    "tck_jue_zhi_tong_info": "回合限一次，可以观察敌方手卡。",
    "tck_514": "514",
    "tck_514_info": "受到伤害进行判定，红色则由对手承担，黑色则扣双倍体力。",
    "tck_yao_guai_shao_nv": "妖怪少女",
    "tck_yao_guai_shao_nv_info": "丢弃一张手卡，可以进行重新判定，一回合限2次。",
    "tck_chi_ba_ba": "吃粑粑",
    "tck_chi_ba_ba_info": "出牌阶段限一次，你可以将一张牌当“屎”，选择1名角色使用：<br/>①若为你，选择一项：<br/>&nbsp;&nbsp;①减1体力上限并加1体力。<br/>&nbsp;&nbsp;②减1体力并摸2张牌。<br/>②若不为你，则其失去1点体力并弃1张牌。<br/>当你摸到“屎”不弃置。",
    "tck_nian_qing": "年轻",
    "tck_nian_qing_info": "回合开始，你回复1点体力并摸1张牌。",
    "tck_3200": "3200",
    "tck_3200_info": "你打出点数为3或2的牌时，你摸1张牌，若你以下法顺序打出牌，你可摸4张牌并视为使用一张杀。<br/>（3，2，任意，任意）",
    "tck_ji_jiu": "急救",
    "tck_ji_jiu_info": "你回合外，你可以将非♠牌当桃使用。",
    "tck_qing_nang": "青囊",
    "tck_qing_nang_info": "出牌阶段限一次，你可弃一张牌，选至多3名角色各弃一张牌，若弃的牌为♠则摸一张牌。然后你令一名角色选择一项：<br/>①回复一点体力。<br/>②摸2张牌。",
    "tck_du_jin": "独进",
    "tck_du_jin_info": "摸牌阶段，你多摸1+X张牌（X为你装备数）。",
    "tck_qing_zhou": "轻舟",
    "tck_qing_zhou_info": "你与其他人距离-X。<br/>（X为你的装备数）",
    "tck_yin_yang": "阴阳",
    "tck_yin_yang_info": "转换技，回合开始，你：<br/>阴：摸4张牌。<br/>阳：回复2体力。<br/>第1滴血只能红牌造成伤害。<br/>第2滴血只能黑牌造成伤害。",
    "tck_hj_ying_zi": "英姿",
    "tck_hj_ying_zi_info": "你可以哈哈笑3声，然后摸牌数改为3。",
    "tck_hj_fan_jian": "反间",
    "tck_hj_fan_jian_info": "出牌阶段限一次，你可以展示一张♦牌，然后交给一名其他角色。",
    "tck_V_zhi_li": "V之力",
    "tck_V_zhi_li_info": "造成伤害或有人用闪判定，若为红桃9，直接胜利。",
    "tck_jin_zhu": "近主",
    "tck_jin_zhu_info": "你与其他玩家距离减X（X为当前回合数）。",
    "tck_wu_zhu": "吾主",
    "tck_wu_zhu_info": "锁定技，与你距离为1的玩家视为“主”，“主”每受到1点伤害你就摸3张牌。",
    "tck_ju_zhu": "惧主",
    "tck_ju_zhu_info": "锁定技，当场上所有玩家都为“主”，你减2点体力上限。",
    "tck_yi_ji": "遗计",
    "tck_yi_ji_info": "你受到1点伤害，你就摸4张牌，然后分配。",
    "tck_tian_du": "天妒",
    "tck_tian_du_info": "你立即获得你的判定牌并摸1张牌。",
    "tck_e_mo": "恶魔",
    "tck_e_mo_info": "登场选择一名角色进入地狱，选中的人进入濒死状态。",
    "tck_heng_heng": "哼哼",
    "tck_heng_heng_info": "手上的锦囊牌可以当万箭齐发。",
    "tck_aaa": "啊~",
    "tck_aaa_info": "手上的基本牌可以当南蛮入侵。",
    "tck_suan_ye": "酸液",
    "tck_suan_ye_info": "你的杀命中后令对方获得一个标记“蚀”，有“蚀”的角色回合开始时执行：<br/>①若为满血：失去1点体力。<br/>②若不为满血：失去1点体力上限。然后移除标记“蚀”。",
    "tck_ba_ling": "霸凌",
    "tck_ba_ling_info": "出牌阶段限一次，你选择1名角色，然后其它角色选一项：<br/>①令你摸1张牌。<br/>②视为对其使用1张杀。",
    "tck_dou_wu": "斗舞",
    "tck_dou_wu_info": "你选一名角色与其拼点，赢方摸输方1张牌，你的点数+3。",
    "tck_ma_shu": "马术",
    "tck_ma_shu_info": "距离永+1。",
    "tck_ya_1": "牙1",
    "tck_ya_1_info": "杀可以多出一张。",
    "tck_ya_2": "牙2",
    "tck_ya_2_info": "杀要2张闪响应。",
    "tck_ya_3": "牙3",
    "tck_ya_3_info": "将黄金回旋打入体内，丢一张手卡回1滴血。",
    "tck_ya_4": "牙4",
    "tck_ya_4_info": "每名角色限1，濒死时可以使用，回复1滴生命并对敌人造成无法回复生命效果并扣2滴血。",
    "tck_di_1_zha_dan": "第1炸弹",
    "tck_di_1_zha_dan_info": "手牌可以当火杀。",
    "tck_chuan_xin_gong_ji": "穿心攻击",
    "tck_chuan_xin_gong_ji_info": "杀没有距离限制。",
    "tck_bai_zhe_shi_shen": "败者食尘",
    "tck_bai_zhe_shi_shen_info": "被对手杀命中，可以进行判定，若为红桃，则无视此伤害并回1颗血。",
    "tck_li_huo": "离火",
    "tck_li_huo_info": "多出一张火杀，无距离限制。（不计杀）（需拟）（回合内）",
    "tck_huo_zhao": "火沼",
    "tck_huo_zhao_info": "火焰伤害无效，冰伤无效。",
    "tck_huo_ze": "火泽",
    "tck_huo_ze_info": "判定红色杀伤害无效。（装备无效）",
    "tck_yu_huo": "浴火",
    "tck_yu_huo_info": "死亡立即复活，体力上限为3，并失去离火和火泽，得连击。[10回合不死重新回到原来]",
    "tck_lian_ji": "连击",
    "tck_lian_ji_info": "回合开始对全部人使用火杀或单独对一个人杀X张火杀。（X为场上人数包括自己）（需拟不计入杀）",
    "tck_chao_feng": "朝凤",
    "tck_chao_feng_info": "回合开始，若场上或弃牌堆内有百鸟朝凤枪，你装备之。",
    "tck_chuan_cheng": "传承",
    "tck_chuan_cheng_info": "觉醒技，你濒死时，增加1点体力和减1点体力上限，摸2张牌，然后选择一名角色，其获得技能“龙胆”，“雄乱”。",
    "tck_dang_xian": "当先",
    "tck_dang_xian_info": "你会和开始前额外获得一个出牌阶段，你可于此出牌阶段视为使用一张杀。",
    "tck_fu_li": "伏枥",
    "tck_fu_li_info": "限定技，你濒死时，你可将体力加至4，手牌摸至4，然后立即执行你的回合。（不触发当先）",
    "tck_shen_wei_mu": "帷幕",
    "tck_shen_wei_mu_info": "锁定技，你的锦囊不能被无懈，其他的人的黑色锦囊对你无效。",
    "tck_shen_jue_sha": "绝杀",
    "tck_shen_jue_sha_info": "出牌阶段限一次，你可弃一张黑色牌，令一人弃置所有牌后摸回等量的牌，然后其展示手牌，弃其中非基本牌，其受到等同于其弃牌数的伤害。",
    "tck_r_fu_xin": "负心",
    "tck_r_fu_xin_info": "出牌阶段限一次，你每减少一点体力上限，你就可以执行下述效果：你从牌堆顶一直展示牌堆顶的一张牌，若为♥，你获得之并停止展示，然后将其余展示放回牌堆底并将牌堆洗牌。",
    "tck_r_hua_tian": "花天",
    "tck_r_hua_tian_info": "出牌阶段限一次，你可以获得一名女性角色的所有手牌，然后你获得技能【中毒】。",
    "tck_r_zhong_du": "中毒",
    "tck_r_zhong_du_info": "锁定技，回合开始时，你失去一点体力上限并失去技能【中毒】。",
    "tck_gao_guai": "搞怪",
    "tck_gao_guai_info": "回合开始时，你从至多2名角色区域各获得1张牌。",
    "tck_yu_yue": "愉悦",
    "tck_yu_yue_info": "你可以把红色牌当桃使用。",
    "tck_wai_zui": "歪嘴",
    "tck_wai_zui_info": "手牌上限+2，可与对手拼点，若你win，则从牌堆中摸2张，若没win，则对方摸你1张手牌。",
    "tck_kuang_xiao": "狂啸",
    "tck_kuang_xiao_info": "手上酒可以回血并且此回合杀的伤害+2.并且决斗对手不可使用杀或无懈。",
    "tck_fei_sha": "飞沙",
    "tck_fei_sha_info": "可以选择对手3张牌。",
    "tck_gu": "孤",
    "tck_gu_info": "跳过弃牌。",
    "tck_xun_huan": "循环",
    "tck_xun_huan_info": "你使用牌结算后判定，若为红桃、梅花，则再结算1次。",
    "tck_lun_hui": "轮回",
    "tck_lun_hui_info": "其他角色对你使用牌时判定，若为方块、黑桃，则将牌的目标改为来源。",
    "tck_xie_sheng": "写生",
    "tck_xie_sheng_info": "可把手上一张锦囊变为桃，你的手牌上限+3。",
    "tck_hui_meng": "绘梦",
    "tck_hui_meng_info": "回合内未打出牌，则可进入无敌状态（连用3回合进入濒死）",
    "tck_bian_shen": "变身",
    "tck_bian_shen_info": "濒死可使用，血量上限升至4，失去写生和绘梦，获得骑士。",
    "tck_qi_shi": "骑士",
    "tck_qi_shi_info": "可以无限出杀。",
    "tck_ji_xian_huo_hua": "极限火花",
    "tck_ji_xian_huo_hua_info": "手上红牌都可以当杀使用。",
    "tck_fei_zhi_xiang_xing_guang_xian": "非指向性光线",
    "tck_fei_zhi_xiang_xing_guang_xian_info": "手上黑牌都可以当闪。",
    "tck_wu_yu": "雾雨",
    "tck_wu_yu_info": "火杀无效，雷杀翻倍。",
    "tck_mi_huo": "迷惑",
    "tck_mi_huo_info": "出牌阶段限一次，你可以弃1张手牌，使一人选择一项：<br/>①翻面。<br/>②弃置所有手牌。",
    "tck_xi_shou": "吸收",
    "tck_xi_shou_info": "回合结束，你选择一个翻面玩家，你令其流失一点体力并摸2张牌，然后你加1点体力上限和体力。",
    "tck_yi_yu": "抑郁",
    "tck_yi_yu_info": "出牌阶段限一次，你可与一人拼点，若你赢，其选择一项：<br/>①失去1点体力上限。<br/>②流失1点体力。<br/>若你输，你获得一个抑标记。",
    "tck_zi_sha": "自杀",
    "tck_zi_sha_info": "锁定技，你的♥牌点数视为K，当你有12个抑标记时，你立即死亡。",
    "tck_hui_fu": "恢复",
    "tck_hui_fu_info": "你受到1点伤害，摸3张牌，若这3张牌颜色均相同，则你回复1点体力。",
    "tck_bao_hu": "保护",
    "tck_bao_hu_info": "当有玩家受伤时，你可以弃1张牌，然后将此伤害转移给你。",
    "tck_r_ji_rou": "肌肉",
    "tck_r_ji_rou_info": "<b>锁定技</b>，你的[杀]需要两张[闪]才能抵消。",
    "tck_r_you_huo": "诱惑",
    "tck_r_you_huo_info": "其他玩家回合开始时，其需弃置一张牌，否则其于回合内无法对你使用牌。",
    "tck_ji_lei_3": "积累·三改",
    "tck_ji_lei_3_info": "锁定技，你每使用一张基本牌、装备牌、锦囊牌、场地牌，你就摸一张牌。",
    "tck_ji_lei_2": "积累·二改",
    "tck_ji_lei_2_info": "锁定技，你每使用一张基本牌、装备牌、锦囊牌，你就摸一张牌。",
    "tck_ji_lei_1": "积累·一改",
    "tck_ji_lei_1_info": "锁定技，你每使用一张基本牌、装备牌，你就摸一张牌。",
    "tck_ji_lei_0": "积累",
    "tck_ji_lei_0_info": "锁定技，你每使用一张基本牌，你就摸一张牌。",
    "tck_xue_xi": "学习",
    "tck_xue_xi_info": "出牌阶段限一次，你可以弃置所有手牌，修改技能【积累】。本技能在第2次使用后减1点体力上限且使用3次后失去之。",
    "tck_diu_shi": "丢失",
    "tck_diu_shi_info": "每轮开始你选择1个数字，当有玩家摸到这个数字的牌时，立即弃置之。",
    "tck_fan_xiang": "反香",
    "tck_fan_xiang_info": "失去【良助】，得到【枭姬】，吃过【良助】的人受伤。",
    "tck_luo_ying": "落英",
    "tck_luo_ying_info": "得到对方弃置的装备牌，【良助】失去后得到。",
    "tck_ju_huo": "惧火",
    "tck_ju_huo_info": "你受到火焰伤害时，你需选择一项：①此伤害+1，②防止此伤害改为减少1点体力上限。",
    "tck_qi_pian": "欺骗",
    "tck_qi_pian_info": "出牌阶段，你可弃1张锦囊牌，令一人对其自己使用一张杀，若不使用，你获得其1张牌，若其使用，你摸1张牌。若其因其的杀受到伤害时，你可防止之并摸2张牌。",
    "tck_gan_shen_me_a_?": "干什么啊？",
    "tck_gan_shen_me_a_?_info": "出牌阶段限1次，你可以将1张牌当孤注一掷使用，然后你本回合杀无次数限制。",
    "tck_bin_si": "濒死",
    "tck_bin_si_info": "当你结算孤注一掷时可判定，若为红桃，负面效果改为只流失1体力。",
    "tck_xi_wang": "希望",
    "tck_xi_wang_info": "你死亡后，将游戏BGM改为《希望之花》。",
    "tck_mei_gui": "玫瑰",
    "tck_mei_gui_info": "游戏开始，你获得5个“玫瑰”标记，你每受到一次伤害，你就失去一个“玫瑰”标记，当你失去所有“玫瑰”标记，你进入濒死，你回复体力时，根据回复量加玫瑰标记（至多为5）。你没有体力上限。",
    "tck_xiao_hai": "小孩",
    "tck_xiao_hai_info": "你攻击范围内的人不能对你使用杀，你的手牌上限视为5。",
    "tck_pin_min": "贫民",
    "tck_pin_min_info": "每人回合开始摸牌后需交给你一张牌，否则其流失一点体力。",
    "tck_ai_xin": "爱心",
    "tck_ai_xin_info": "当有人进入濒死状态时，你可弃1张红色手牌，令其体力回复至1。",
    "tck_chang": "唱",
    "tck_chang_info": "手上的红色牌可以当闪使用。",
    "tck_tiao": "跳",
    "tck_tiao_info": "手上的梅花可以替换判定。",
    "tck_rap": "Rap",
    "tck_rap_info": "开局摸6张牌。",
    "tck_lan_qiu": "篮球",
    "tck_lan_qiu_info": "缺少运动神经，使用唱时要判定，如果是梅花则不可用唱。",
    "tck_ji_qi_shi": "鷄骑士",
    "tck_ji_qi_shi_info": "与对手距离永远减1。",
    "tck_ji_qian_feng": "鷄前锋",
    "tck_ji_qian_feng_info": "摸到黑色牌且点数大于等于10，则增加1点血量上限，最高+3层。",
    "tck_qiu_chang_ji_qing": "球场鷄情",
    "tck_qiu_chang_ji_qing_info": "失去1点体力上限，使对手武将翻面1回合。",
    "tck_hj_tian_rou": "甜肉",
    "tck_hj_tian_rou_info": "出牌阶段，你可以弃置2张牌（至少为2），然后回复1点体力。",
    "tck_hj_kuang_gu": "狂骨",
    "tck_hj_kuang_gu_info": "你造成伤害时，可将此伤害视为造成伤害，若此伤害为你为造成伤害，则你对其造成的伤害值修改为1，然后选择一项：<br/>①再发动一次本技能；②回复一点体力并扣一点体力。",
    "tck_hj_jiang_chi": "将驰",
    "tck_hj_jiang_chi_info": "出牌阶段，你可以摸一摸牌。",
    "tck_zhu_shi": "注视",
    "tck_zhu_shi_info": "当有玩家打出闪时，你可令其判定，若不为红桃，则其获得一个“眨眼”标记。",
    "tck_ning_bo": "拧脖",
    "tck_ning_bo_info": "当有玩家的“眨眼”标记达到4个时，你令其进入濒死状态。",
    "tck_ji_ta": "吉他",
    "tck_ji_ta_info": "回合开始给自己一层“音乐”标记，给对手2层可令其扣1格血，并自身回复1格。",
    "tck_ge_sheng_wai_fang": "歌声外放",
    "tck_ge_sheng_wai_fang_info": "“音乐”标记堆到8层时，可免疫一切锦囊。",
    "tck_pa_si": "怕死",
    "tck_pa_si_info": "自带一回合防具，在对手回合开始时进行判定，若为红桃则视为携带八卦阵，若为黑桃则视为携带藤甲，若为梅花则视为携带白银狮子，若为方块则视为携带仁王盾。",
    "tck_lao_dong_zui_guang_rong": "劳动最光荣",
    "tck_lao_dong_zui_guang_rong_info": "无视乐不思蜀，免疫屎效果。（敢吃屎）",
    "tck_bu_lao_er_huo": "不劳而获",
    "tck_bu_lao_er_huo_info": "回合开始额外获得2张牌。",
    "tck_bu_zhi_hao_dai": "不知好歹",
    "tck_bu_zhi_hao_dai_info": "没脸没皮，回合内可以多出2张杀。",
    "tck_lao_dong_zhi_xing": "劳动之星",
    "tck_lao_dong_zhi_xing_info": "支付1颗勾玉，从牌堆获得至锦囊牌的所有牌。",
    "tck_gou_yan_can_chuan": "苟延残喘",
    "tck_gou_yan_can_chuan_info": "濒死状态时发动，减少生命上限至1点，并恢复满血。（每局一次）",
    "tck_gao_xiao": "搞笑",
    "tck_gao_xiao_info": "出牌阶段限二次，你指定一人对你使用一张杀：<br/>①若不出杀，其流失1点体力。<br/>②若出杀，则：<br/>①若未造成伤害，你弃其一张牌。<br/>②若造成伤害，其摸一张牌，然后：<br/>①若此杀为红，你回复1点体力。<br/>②若此杀为黑，其本轮不能对你使用牌。",
  }
}
export default skills