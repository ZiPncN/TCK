import { lib, game, get, _status, ui } from "../../../../noname.js";
import { taoList } from '../natures.js'
import TCKUtil from "../utils.js"
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
        await trigger.player.loseHp(trigger.player.hp)
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
        await player.awakenSkill("tck_gou_yan_can_chuan")
        let loseMaxHpNum = player.maxHp - 1
        await player.loseMaxHp(loseMaxHpNum)
        await player.recoverTo(player.maxHp)
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
        let res = await trigger.player.chooseToGive(`请交给${get.translation(player)}一张牌，否则流失1点体力`, player, 1, "he", false).forResult()
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
        await trigger.player.recoverTo(1)
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
        await player.recoverTo(player.maxHp)
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
      init(player) {
        player.storage.tck_e_mo = true
      },
      trigger: {
        global: "phaseBefore",
        player: "enterGame",
      },
      filter(event, player) {
        return player.storage.tck_e_mo && (event.name != "phase" || game.phaseNumber == 0)
      },
      async content(event, trigger, player) {
        let res = await player.chooseTarget("请选择一名目标，令其进入地狱", 1, true).forResult()
        if (res.bool) {
          let target = res.targets[0]
          await target.loseHp(target.hp)
        }
        player.storage.tck_e_mo = false
        await player.awakenSkill("tck_e_mo")
        // await player.removeSkill("tck_e_mo")
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
          const winners = player.getFriends()
          game.over(player == game.me || winners.includes(game.me))
        }
      },
    },
    "tck_hj_ying_zi": {
      trigger: { player: "phaseDrawBegin2" },
      filter(event, player) {
        return !event.numFixed;
      },
      async content(event, trigger, player) {
        trigger.num = 3
        const voices = [
          ...get.Audio.skill({ skill: "yingzi", player: "zhouyu" }).audioList,
          ...get.Audio.skill({ skill: "reyingzi", player: "re_zhouyu" }).audioList,
        ].filter(v => v.text?.includes("哈哈"))
        if (!voices.length) return
        const voice = voices[Math.floor(Math.random() * voices.length)]
        await player.chat(voice.text)
        game.broadcastAll(file => game.playAudio(file), voice.file)
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
        const res2 = await player.chooseTarget('请选择一名其他角色，将此牌交给该角色', (card, player, target) => target != player).forResult()
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
        player: "phaseDrawBegin2"
      },
      filter(event, player) {
        return !event.numFixed;
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
            global: ["useCardBegin", "respondBegin"]
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
    "tck_bao_nu": {
      enable: ["phaseUse"],
      usable: 1,
      async content(event, trigger, player) {
        await player.addTempSkill("tck_bao_nu_buff1", { player: "phaseJieshuAfter" })
        await player.addTempSkill("tck_bao_nu_buff2", { player: "phaseJieshuAfter" })
        await player.addTempSkill("tck_bao_nu_getdebuff", { player: "phaseUseBefore" })
      },
      subSkill: {
        "buff1": {
          mark: true,
          intro: {
            content: "无法闪避",
          },
          sub: true,
          source: "tck_bao_nu",
          forced: true,
          trigger: { player: "useCard" },
          async content(event, trigger, player) {
            await trigger.directHit.addArray(game.players);
          },
        },
        "buff2": {
          mark: true,
          intro: {
            content: "伤害翻倍",
          },
          sub: true,
          source: "tck_bao_nu",
          forced: true,
          trigger: { source: "damageBegin" },
          async content(event, trigger, player) {
            trigger.num *= 2
          },
        },
        "getdebuff": {
          charlotte: true,
          forced: true,
          popup: false,
          trigger: {
            player: "phaseZhunbeiBefore"
          },
          async content(event, trigger, player) {
            await player.addTempSkill("tck_bao_nu_debuff", { player: "phaseJieshuAfter" })
          },
        },
        "debuff": {
          sub: true,
          source: "tck_bao_nu",
          mod: {
            cardEnabled2(card) {
              if (get.position(card) == "h") {
                return false;
              }
            },
          },
          mark: true,
          intro: {
            content: "无法出牌",
          },
        }
      }
    },
    "tck_feng_kuang_zuan_shi": {
      enable: ["phaseUse"],
      usable: 1,
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.recover(1)
        if (player.isHealthy()) {
          await player.loseHp(2)
        }
      },
    },
    "tck_fa_xing": {
      forced: true,
      trigger: {
        player: "damageBegin"
      },
      filter(event, player) {
        return event.source != player && event.source.countCards("e", card => get.equiptype(card) == 1 /** 武器 */) > 0
      },
      async content(event, trigger, player) {
        await trigger.cancel()
      }
    },
    "tck_nan_men": {
      enable: "chooseToUse",
      usable: 3,
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
      prompt: "基本牌当南蛮入侵"
    },
    "tck_men": {
      forced: true,
      trigger: {
        player: "damageBegin"
      },
      filter(event, player) {
        return get.name(event.card) == 'sha'
      },
      async content(event, trigger, player) {
        let res = await player.judge(card => {
          if (get.color(card) == 'black') return -1
          return 1
        }).forResult()
        if (get.color(res) == 'black') return
        await trigger.cancel()
      }
    },
    "tck_dang_xian": {
      forced: true,
      trigger: {
        player: "phaseZhunbeiBefore"
      },
      async content(event, trigger, player) {
        if (player.hasSkill("tck_dang_xian_disable")) {
          await player.removeSkill("tck_dang_xian_disable")
          return
        }
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
        },
        "disable": {
          sub: true,
          sourceSkill: "tck_dang_xian",
        },
      }
    },
    "tck_fu_li": {
      mark: true,
      skillAnimation: true,
      limited: true,
      trigger: {
        player: "dying"
      },
      filter(event, player) {
        if (player.storage.tck_fu_li) return false // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_fu_li")
        await player.recoverTo(4)
        await player.drawTo(4)
        // 立即执行你的回合
        await player.addSkill("tck_dang_xian_disable")
        let evt = _status.event.getParent("phaseLoop", true)
        if (evt) {
          ui.clear()
          let evtx = _status.event
          while (evtx != evt) {
            evtx.finish()
            evtx.untrigger(true)
            evtx = evtx.getParent()
          }
          evtx.player = player.getPrevious()
        }
        player.storage.tck_fu_li = true
      }
    },
    "tck_zhan": {
      mod: {
        // cardname(card, player) {
        //   if (lib.card[card.name].type == "basic") {
        //     return "sha";
        //   }
        // },
        cardnature(card, player) {
          if (get.name(card) == "sha") {
            return "tck_kan";
          }
        }
      }
    },
    "tck_chu_zi": {
      enable: "chooseToUse",
      filterCard(card) {
        return get.type(card) == "delay" || get.type(card) == "trick"
      },
      position: "h",
      viewAs: { name: "taoyuan" },
      viewAsFilter(player) {
        if (!player.countCards("h", card => get.type(card) == "delay" || get.type(card) == "trick")) {
          return false;
        }
      },
      prompt: "将一张锦囊牌当桃园结义使用",
    },
    "tck_ban_ren_ban_ling": {
      mark: true,
      skillAnimation: true,
      limited: true,
      trigger: {
        player: "dying"
      },
      filter(event, player) {
        if (player.storage.tck_ban_ren_ban_ling) return false // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_ban_ren_ban_ling")
        await player.removeSkill("tck_zhan")
        await player.recoverTo(player.maxHp)
        player.storage.tck_ban_ren_ban_ling = true
      },
    },
    "tck_tao_wa": {
      charlotte: true,
      forced: true,
      trigger: {
        global: "gameStart"
      },
      async content(event, trigger, player) {
        let list = []
        const charList = Object.keys(lib.character)
        if (charList.length > 0) {
          for (let i = 0; i < 3 && charList.length > 0; i++) {
            const j = Math.floor(Math.random() * charList.length)
            list.push(charList.splice(j, 1)[0])
          }
        }
        if (!list.length) {
          return
        }
        const result = await player
          .chooseButton(true)
          .set("createDialog", ["请选择其中一个替换你的将牌", [list, "character"]])
          .forResult()
        if (result?.links?.length) {
          await player.reinit(player.name, result.links[0])
          player.hp = player.maxHp
          player.group = lib.character[result.links[0]][1]
        }
      },
    },
    "tck_??": {
      charlotte: true,
      forced: true,
      trigger: {
        global: "gameStart"
      },
      async content(event, trigger, player) {
        const res = await player.chooseTarget("请选择一名其他角色，将武将牌变成其的武将。", true, (card, player, target) => target != player).forResult()
        const target = res.targets[0]
        await player.reinit(player.name, target.name1)
        player.hp = player.maxHp
        player.group = lib.character[target.name1][1]
      }
    },
    "tck_tian_nan_men": {
      enable: "chooseToUse",
      filterCard: true,
      position: "h",
      viewAs: { name: "tck_card_nanmen" },
      viewAsFilter(player) {
        return player.countCards("h") > 0
      },
      prompt: "手上任意一张牌当南门无限次数"
    },
    "tck_chi_shou_dian_tong": {
      trigger: {
        player: "recoverBegin",
      },
      async content(event, trigger, player) {
        await player.draw(2)
        let target = await player.getNext()
        while (target && target != player) {
          const card = await game.createCard({ name: 'sha', nature: 'tck_light' })
          await player.useCard(card, target)
          target = await target.getNext()
        }
      }
    },
    "tck_xia_si_ren": {
      trigger: {
        player: "damageEnd",
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.suit(card) == "spade") return 1
          return -1
        }).forResult()
        if (get.suit(res) == "spade") {
          const res = await player.chooseTarget(true, (card, player, target) => player != target).forResult()
          await res.targets[0].damage(2, player)
        }
      }
    },
    "tck_jing_ce": {
      trigger: {
        player: "phaseJieshuBegin"
      },
      intro: {
        content: "本回合已使用#张牌"
      },
      filter(event, player) {
        return player.hasMark("tck_jing_ce")
      },
      async content(event, trigger, player) {
        const useNum = await player.countMark("tck_jing_ce")
        await player.draw(useNum)
        await player.clearMark("tck_jing_ce")
        const evt = trigger.getParent("phase", true)
        if (evt) {
          evt.phaseList.splice(evt.num + 1, 0, `phaseUse|${event.name}`)
        }
      },
      group: ["tck_jing_ce_use", "tck_jing_ce_clear"],
      subSkill: {
        "use": {
          popup: false,
          forced: true,
          charlotte: true,
          trigger: {
            player: "useCard"
          },
          filter(event, player) {
            const evt = event.getParent("phase", true)
            return _status.currentPhase == player && evt && evt.phaseList[evt.num] == "phaseUse"
          },
          async content(event, trigger, player) {
            await player.addMark("tck_jing_ce", 1)
          }
        },
        "clear": {
          popup: false,
          forced: true,
          charlotte: true,
          trigger: {
            player: "phaseEnd"
          },
          filter(event, player) {
            return player.hasMark("tck_jing_ce")
          },
          async content(event, trigger, player) {
            await player.clearMark("tck_jing_ce")
          }
        }
      }
    },
    "tck_shi_yong": {
      forced: true,
      trigger: {
        player: "damageEnd"
      },
      filter(event, player) {
        return (!!event.card && get.color(event.card) == "red") || event.num >= 2
      },
      async content(event, trigger, player) {
        if (trigger.num >= 2) {
          const source = trigger.source
          if (!!source) {
            await source.draw(1)
          }
          await player.draw(trigger.num - 1)
        } else {
          await player.draw(1)
        }
      }
    },
    "tck_jian_lai": {
      enable: "phaseUse",
      position: "he",
      viewAs: { name: "wanjian" },
      viewAsFilter(player) {
        return player.countCards("he") > 1
      },
      filterCard: true,
      selectCard: 2,
    },
    "tck_pai_lai": {
      forced: true,
      trigger: {
        global: "die"
      },
      async content(event, trigger, player) {
        await player.draw(3)
      }
    },
    "tck_yin_ka": {
      mark: true,
      intro: {
        content: "整局游戏剩余可用#次"
      },
      init(player) {
        player.storage.tck_yin_ka = 3
      },
      enable: ["chooseToUse", "chooseToRespond"],
      filter(event, player) {
        return player.countCards("h") > 0 && player.storage.tck_yin_ka > 0
      },
      chooseButton: {
        dialog(event, player) {
          let list = [];
          for (let name of lib.inpile) {
            if (get.type(name) == "basic" || get.type(name) == "trick" || get.type(name) == "delay" || get.type(name) == "equip" || get.type(name) == "land") {
              list.push([get.translation(get.type(name)), "", name]);
              if (name == "sha") {
                for (let j of lib.inpile_nature) {
                  list.push(["基本", "", "sha", j]);
                }
              }
              if (name == "shan" && !!lib.card.shan['tck_nature']) {
                for (let j of lib.card.shan['tck_nature']) {
                  list.push(["基本", "", "shan", j]);
                }
              }
              if (name == "jiu" && !!lib.card.jiu['tck_nature']) {
                for (let j of lib.card.jiu['tck_nature']) {
                  list.push(["基本", "", "jiu", j]);
                }
              }
              if (name == "wuxie" && !!lib.card.wuxie['tck_nature']) {
                for (let j of lib.card.wuxie['tck_nature']) {
                  list.push(["锦囊", "", "wuxie", j]);
                }
              }
            }
          }
          return ui.create.dialog("印卡", [list, "vcard"]);
        },
        filter(button, player) {
          return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
        },
        backup(links, player) {
          return {
            filterCard: true,
            popname: true,
            viewAs: { name: links[0][2], nature: links[0][3] },
            onuse() {
              player.storage.tck_yin_ka--
              if (player.storage.tck_yin_ka < 0) player.storage.tck_yin_ka = 0
              player.updateMark("tck_yin_ka")
            },
            onrespond() {
              player.storage.tck_yin_ka--
              if (player.storage.tck_yin_ka < 0) player.storage.tck_yin_ka = 0
              player.updateMark("tck_yin_ka")
            }
          }
        },
        prompt(links, player) {
          return "将一张手牌当做" + get.translation(links[0][2]) + "使用或打出"
        },
      }
    },
    "tck_ao_xi_li_si": {
      mod: {
        globalTo(from, to, distance) {
          return distance + 1;
        },
      },
    },
    "tck_ling_hun_chong_ji": {
      enable: "phaseUse",
      async content(event, trigger, player) {
        const pileCards = get.cards(3, false)
        const res = await player.chooseToMove()
          .set("list", [["牌堆顶", pileCards]])
          .forResult()

        if (res.bool) {
          const cards = res.moved[0].slice(0)
          if (cards?.length) {
            cards.reverse()
            // game.log(player, "将", cards, "置于牌堆顶")
            await game.cardsGotoPile(cards, "insert")
          }
        }
      },
      group: ["tck_ling_hun_chong_ji_watch"],
      subSkill: {
        "watch": {
          enable: "phaseUse",
          round: 2,
          filterTarget(card, player, target) {
            return target.countCards("h") > 0 && player != target
          },
          async content(event, trigger, player) {
            await player.viewHandcards(event.target)
          }
        }
      }
    },
    "tck_rkshs_xin_shan": {
      trigger: {
        source: "damageBegin"
      },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == 'sha' && event.player.hp < 2
      },
      async content(event, trigger, player) {
        trigger.num--
      },
      group: ["tck_rkshs_xin_shan_1"],
      subSkill: {
        "1": {
          trigger: {
            player: "damageBegin"
          },
          forced: true,
          filter(event, player) {
            return player.hp <= 3
          },
          async content(event, trigger, player) {
            trigger.num--
          }
        }
      }
    },
    "tck_jiu_jie": {
      trigger: {
        source: "damageBegin",
        player: "damageBegin"
      },
      async content(event, trigger, player) {
        await trigger.cancel()
        await trigger.player.loseHp(trigger.num)
        const res = await player.judge(card => {
          if (get.color(card) == 'red') return 1
          else if (get.color(card) == 'black') return -2
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          await player.draw(1)
          await player.recover(1)
        } else if (get.color(res) == 'black') {
          await player.chooseToDiscard(1, true, "he")
        }
      }
    },
    "tck_dan_chun": {
      charlotte: true,
      forced: true,
      trigger: {
        target: "useCardToTarget"
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.color(card) == 'red') return 1
          else if (get.color(card) == 'black') return -2
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          const source = trigger.player
          const res = await source.chooseToDiscard(`请弃置一张牌，否则${get.translation(trigger.card)}失效`, 1, "he").forResult()
          if (!res.bool) {
            // 该牌失效
            const evt = trigger.getParent(1)
            evt.targets.length = 0
            evt.all_excluded = true
            await trigger.cancel()
          }
        } else if (get.color(res) == 'black') {
          await trigger.directHit.addArray(game.players)
        }
      }
    },
    "tck_xin_shan": {
      enable: "phaseUse",
      usable: 1,
      filterTarget: true,
      selectTarget: 1,
      async content(event, trigger, player) {
        const target = event.target
        let options = [
          ["draw", `摸2张牌`],
        ]
        if (target.isDamaged()) {
          options.push(["recover", `回复1点体力`])
        }
        const res = await target
          .chooseButton([
            get.prompt(event.name),
            [options, "textbutton",]
          ], true)
          .forResult();
        if (res.bool) {
          switch (res.links[0]) {
            case 'draw':
              await target.draw(2);
              break;
            case 'recover':
              await target.recover()
              break;
          }
        }
      }
    },
    "tck_jian_shen": {
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        await player.loseHp(1)
        let result = await player
          .chooseButton([
            get.prompt(event.name),
            [[
              ["①", `体力上限+1`],
              ["②", `摸3张牌`],
              ["③", `回复一点体力并摸1张牌`]
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await player.gainMaxHp(1)
              break;
            case '②':
              await player.draw(3)
              break;
            case '③':
              await player.recover(1)
              await player.draw(1)
              break;
          }
        }
      }
    },
    "tck_quan_ji": {
      enable: "phaseUse",
      usable: 1,
      filterTarget(card, player, target) {
        return target.countCards("h") > 0 && player != target
      },
      filter(event, player) {
        return player.countCards("h") > 0 && game.hasPlayer(function (current) {
          return current != player && player.canCompare(current)
        })
      },
      async content(event, trigger, player) {
        const res = await player.chooseToCompare(event.target).forResult()
        if (res.bool) {
          // 赢
          await player.gainPlayerCard("he", event.target, true).set("target", event.target)
          await event.target.damage(player)
        } else {
          // 输
          await event.target.discardPlayerCard(player, "he", true)
        }
      }
    },
    "tck_jie_feng": {
      trigger: {
        player: "phaseZhunbei"
      },
      filter(event, player) {
        return player.countCards("he") > 0
      },
      async content(event, trigger, player) {
        const res = await player.chooseToDiscard("he", true).forResult()
        if (res.bool) {
          await player.addTempSkill("tck_jie_feng_effect", { player: "phaseJieshuAfter" })
        }
      },
      subSkill: {
        "effect": {
          sub: true,
          sourceSkill: "tck_jie_feng",
          mark: true,
          marktext: "解",
          intro: {
            name: "解封",
            content: "本回合你造成的伤害+1",
          },
          trigger: {
            source: "damageBegin"
          },
          charlotte: true,
          forced: true,
          async content(event, trigger, player) {
            trigger.num += 1
          }
        }
      }
    },
    "tck_mian_bao": {
      enable: "chooseToUse",
      usable: 1,
      filterCard: true,
      position: "he",
      viewAs: { name: "tck_card_mian_bao" },
      viewAsFilter(player) {
        if (!player.hasCards("he")) {
          return false;
        }
      },
      prompt: "将一张牌当面包使用",
    },
    "tck_jian_xi": {
      mod: {
        targetInRange(card, player, target, now) {
          if (["trick", "delay"].includes(get.type(card))) {
            return true
          }
        }
      }
    },
    "tck_shi_shen": {
      enable: "phaseUse",
      filterCard(card, player) {
        if (ui.selected.cards.length) {
          return get.suit(card) == get.suit(ui.selected.cards[0])
        }
        return true
      },
      position: "he",
      selectCard: 3,
      complexCard: true,
      complexSelect: true,
      filter(event, player) {
        return player.countCards("he") > 2 && !game.hasPlayer(p => p.name == 'tck_bayunlan' && p.storage.tck_shi_shen)
      },
      async content(event, trigger, player) {
        await player.summonFriend("tck_bayunlan", true, "tck_shi_shen")
      },
      group: ['tck_shi_shen_effect'],
      subSkill: {
        "effect": {
          unique: true,
          forced: true,
          popup: false,
          firstDo: true,
          trigger: {
            global: "die"
          },
          filter(event, player) {
            return event.player.storage.tck_shi_shen
          },
          async content(event, trigger, player) {
            delete trigger.player.storage.tck_shi_shen
            await game.removePlayerOL(trigger.player)
          },
        },
      }
    },
    "tck_jie_jie": {
      global: "tck_jie_jie",
      mod: {
        targetInRange(card, player, target, now) {
          if (get.name(card) == 'sha') {
            return true
          }
        }
      }
    },
    "tck_dong_mian": {
      round: 4,
      trigger: {
        player: "phaseZhunbei"
      },
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.skip("phaseDraw")
        await player.skip("phaseUse")
        await player.recover(1)
      }
    },
    "tck_ji_suan_ji": {
      ai: {
        viewHandcard: true,
        skillTagFilter(player, tag, arg) {
          if (player == arg) {
            return false;
          }
        },
      },
    },
    "tck_shi_shen2": {
      enable: "phaseUse",
      filterCard(card, player) {
        if (ui.selected.cards.length) {
          return get.suit(card) == get.suit(ui.selected.cards[0])
        }
        return true
      },
      position: "he",
      selectCard: 2,
      complexCard: true,
      complexSelect: true,
      filter(event, player) {
        return player.countCards("he") > 1 && !game.hasPlayer(p => p.name == 'tck_cheng' && p.storage.tck_shi_shen)
      },
      async content(event, trigger, player) {
        await player.summonFriend("tck_cheng", true, "tck_shi_shen")
      },
      group: ['tck_shi_shen_effect'],
    },
    "tck_xin_ruan": {
      trigger: {
        player: "phaseZhunbei"
      },
      filter(event, player) {
        return game.hasPlayer(p => p.hasSkill("tck_xin_ruan_mark"))
      },
      async content(event, trigger, player) {
        let result = await player
          .chooseButton([
            get.prompt(event.name),
            [[
              ["①", `伤害+1`],
              ["②", `每回合摸对手1张牌`]
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await player.addTempSkill("tck_xin_ruan_1", { player: "phaseJieshuAfter" })
              break;
            case '②':
              await player.addTempSkill("tck_xin_ruan_2", { player: "phaseJieshuAfter" })
              break;
          }
        }
      },
      subSkill: {
        "1": {
          forced: true,
          sub: true,
          sourceSkill: "tck_xin_ruan",
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            return event.player.hasSkill("tck_xin_ruan_mark")
          },
          async content(event, trigger, player) {
            trigger.num += 1
          }
        },
        "2": {
          init(player) {
            player.storage.tck_xin_ruan_2 = []
          },
          sub: true,
          sourceSkill: "tck_xin_ruan",
          enable: "phaseUse",
          filter(event, player) {
            return game.hasPlayer(p => p.hasSkill("tck_xin_ruan_mark") && !player.storage.tck_xin_ruan_2.some(currunt => currunt == p) && p.countCards("he") > 0)
          },
          filterTarget(card, player, target) {
            return target.hasSkill("tck_xin_ruan_mark") && !player.storage.tck_xin_ruan_2.some(p => p == target) && target.countCards("he") > 0
          },
          async content(event, trigger, player) {
            await player.gainPlayerCard(event.target, "he", true)
            player.storage.tck_xin_ruan_2.push(event.target)
          }
        },
        "mark": {
          charlotte: true,
          onremove: true,
          sub: true,
          sourceSkill: "tck_xin_ruan",
          mark: true,
          marktext: "软",
          intro: {
            name: "心软标记",
          },
        }
      }
    },
    "tck_mai_meng": {
      trigger: { target: "useCardToTarget" },
      forced: true,
      async content(event, trigger, player) {
        if (!trigger.player.hasSkill("tck_xin_ruan_mark"))
          await trigger.player.addSkill("tck_xin_ruan_mark")
        const res = await trigger.player.chooseBool('你下得去手吗？').forResult()
        if (res.bool) {
          const evt = trigger.getParent();
          evt.triggeredTargets2.remove(player);
          evt.targets.remove(player);
        }
      },
    },
    "tck_sa_jiao": {
      enable: "phaseUse",
      filterTarget(card, player, target) {
        return player != target && target.countCards("he") > 0
      },
      filter(event, player) {
        return game.hasPlayer(p => p != player && p.countCards("he") > 0)
      },
      async content(event, trigger, player) {
        if (!event.target.hasSkill("tck_xin_ruan_mark"))
          await event.target.addSkill("tck_xin_ruan_mark")
        await event.target.chooseToGive(`是否交给${get.translation(player)}一至两张牌？`, "he", player, [1, 2])
      },
    },
    "tck_peng_lai_ren_ou": {
      enable: "phaseUse",
      filter(event, player) {
        return player.countCards("h") > 0 && !game.hasPlayer(p => p.name == 'tck_penglairenou' && p.storage.tck_peng_lai_ren_ou)
      },
      async content(event, trigger, player) {
        await player.discard(player.getCards("h"))
        const player2 = await player.summonFriend("tck_penglairenou", true, "tck_peng_lai_ren_ou")
        player2.storage.tck_shang_hai_ren_ou_master = player
        if (!player.storage.tck_qi_se_ren_ou_shi) {
          player.storage.tck_qi_se_ren_ou_shi = []
        }
        player.storage.tck_qi_se_ren_ou_shi.push(player2)
      },
      group: ['tck_peng_lai_ren_ou_effect'],
      subSkill: {
        "effect": {
          unique: true,
          forced: true,
          popup: false,
          firstDo: true,
          trigger: {
            global: "die"
          },
          filter(event, player) {
            return event.player.storage.tck_peng_lai_ren_ou
          },
          async content(event, trigger, player) {
            delete trigger.player.storage.tck_peng_lai_ren_ou
            player.storage.tck_qi_se_ren_ou_shi.remove(trigger.player)
            await game.removePlayerOL(trigger.player)
            await player.popup("tck_peng_lai_ren_ou")
            if (trigger.source) {
              await trigger.source.loseHp(1)
              await player.$skill(get.translation("tck_huai_bao_xi_sheng_de_zha_dan"))
              await trigger.source.addSkill("tck_huai_bao_xi_sheng_de_zha_dan_debuff")
            }
            await player.awakenSkill("tck_peng_lai_ren_ou")
          },
        },
      }
    },
    "tck_shang_hai_ren_ou": {
      enable: "phaseUse",
      filter(event, player) {
        return player.countCards("e") > 0 && !game.hasPlayer(p => p.name == 'tck_shanghairenou' && p.storage.tck_shang_hai_ren_ou)
      },
      async content(event, trigger, player) {
        await player.discard(player.getCards("e"))
        const player2 = await player.summonFriend("tck_shanghairenou", true, "tck_shang_hai_ren_ou")
        player2.storage.tck_shang_hai_ren_ou_master = player
        if (!player.storage.tck_qi_se_ren_ou_shi) {
          player.storage.tck_qi_se_ren_ou_shi = []
        }
        player.storage.tck_qi_se_ren_ou_shi.push(player2)
      },
      group: ['tck_shang_hai_ren_ou_effect'],
      subSkill: {
        "effect": {
          unique: true,
          forced: true,
          popup: false,
          firstDo: true,
          trigger: {
            global: "die"
          },
          filter(event, player) {
            return event.player.storage.tck_shang_hai_ren_ou
          },
          async content(event, trigger, player) {
            delete trigger.player.storage.tck_shang_hai_ren_ou
            player.storage.tck_qi_se_ren_ou_shi.remove(trigger.player)
            await game.removePlayerOL(trigger.player)
            await player.popup("tck_shang_hai_ren_ou")
            await player.draw(4)
          },
        },
      }
    },
    "tck_qi_se_ren_ou_shi": {
      init(player) {
        player.storage.tck_qi_se_ren_ou_shi = []
      },
      trigger: {
        player: "damageBegin"
      },
      forced: true,
      filter(event, player) {
        return game.hasPlayer(p => player.storage.tck_qi_se_ren_ou_shi.some(p1 => p1 == p))
      },
      async content(event, trigger, player) {
        trigger.cancel()
      },
    },
    "tck_cao_zong_zhe_sh": {
      unique: true,
      trigger: {
        global: "damageBegin"
      },
      forced: true,
      filter(event, player) {
        const master = player.storage.tck_shang_hai_ren_ou_master
        if (!master) return false
        const target = event.player
        if (!target) return false
        if (target == master)
          return true
      },
      async content(event, trigger, player) {
        trigger.cancel()
      },
    },
    "tck_ren_ou_shi_jie": {
      trigger: {
        player: "phaseDrawBegin"
      },
      async content(event, trigger, player) {
        let color
        let cards = []
        while (true) {
          const res = await player.judge().forResult()
          if (!color) color = get.color(res)
          if (get.color(res) != color) break
          cards.push(res.card)
        }
        await player.gain(cards, 'gain2')
      }
    },
    "tck_mu_yu_he_feng": { unique: true },
    "tck_cao_zong_zhe_pl": {
      unique: true,
      trigger: {
        global: "damageBegin"
      },
      forced: true,
      filter(event, player) {
        const master = player.storage.tck_shang_hai_ren_ou_master
        if (!master) return false
        const target = event.player
        if (!target) return false
        if (target == master || target.name == 'tck_shanghairenou' && target.storage.tck_shang_hai_ren_ou && master.storage.tck_qi_se_ren_ou_shi?.some(p => p == target))
          return true
      },
      async content(event, trigger, player) {
        trigger.cancel()
      },
    },
    "tck_huai_bao_xi_sheng_de_zha_dan": {
      unique: true,
      subSkill: {
        "debuff": {
          mark: true,
          marktext: "怀",
          forced: true,
          charlotte: true,
          intro: {
            name: "怀抱牺牲的炸弹",
            content: "只能在濒死时治疗",
          },
          trigger: {
            player: "recoverBegin"
          },
          filter(event, player) {
            return !player.isDying()
          },
          async content(event, trigger, player) {
            trigger.cancel()
          },
        }
      }
    },
    "tck_wei_shan": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.countCards("h") > 0
      },
      filterCard: true,
      position: "h",
      filterTarget(card, player, target) {
        return player != target && target.isDamaged()
      },
      async content(event, trigger, player) {
        const target = event.target
        await target.recover(1)
        let result = await target
          .chooseButton([
            '请选择一项',
            [[
              ["①", `流失2点体力`],
              ["②", `弃至少2张牌`]
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await target.loseHp(2)
              break;
            case '②':
              if (target.countCards("he") <= 2) {
                await target.discard(target.countCards("he"))
              } else {
                await target.chooseToDiscard("he", [2, Infinity], true)
              }
              break;
          }
        }
      },
    },
    "tck_jiao_huan": {
      mark: true,
      skillAnimation: true,
      limited: true,
      enable: "phaseUse",
      filter(event, player) {
        if (player.storage.tck_jiao_huan) return false // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_jiao_huan")
        if (player.hp > 1) {
          await player.loseHp(player.hp - 1)
        }
        const res = await player.chooseTarget((card, player, target) => target != player, true).forResult()
        const target = res.targets[0]
        const playerInfo = {
          maxHp: player.maxHp,
          hp: player.hp,
          name: player.name
        }
        const targetInfo = {
          maxHp: target.maxHp,
          hp: target.hp,
          name: target.name
        }
        await player.changeCharacter([targetInfo.name])
        await target.changeCharacter([playerInfo.name])
        player.maxHp = targetInfo.maxHp
        player.hp = targetInfo.hp
        target.maxHp = playerInfo.maxHp
        target.hp = playerInfo.hp
        await player.update()
        await target.update()
        await target.awakenSkill("tck_jiao_huan")

        const drawNum = targetInfo.hp - playerInfo.hp
        await target.draw(Math.abs(drawNum))

        target.storage.tck_jiao_huan = true
        player.storage.tck_jiao_huan = true
      },
    },
    "tck_xiong_yi": {
      mark: true,
      skillAnimation: true,
      limited: true,
      enable: "phaseUse",
      filter(event, player) {
        if (player.storage.tck_xiong_yi) return false // 已使用过则不能发动
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_xiong_yi")
        const options = [
          ["②", `令一人摸3张牌，一人摸6张牌`],
          ["③", `令一人摸9张牌`]
        ]
        // 场上有2人以上
        if (game.players.length > 2) {
          options.unshift(["①", `令三人各摸3张牌`])
        }
        let result = await player
          .chooseButton([
            get.prompt(event.name),
            [options, "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              const res1 = await player.chooseTarget(3, true).forResult()
              const targets1 = res1.targets
              for (let target of targets1) {
                await target.draw(3)
              }
              break;
            case '②':
              const res2 = await player.chooseTarget("请选择摸3张牌的目标", 1, true).forResult()
              const draw3target2 = res2.targets[0]
              const res2_1 = await player.chooseTarget("请选择摸6张牌的目标", (card, player, target) => target != draw3target2, 1, true).forResult()
              const draw6target2 = res2_1.targets[0]
              await draw3target2.draw(3)
              await draw6target2.draw(6)
              break;
            case '③':
              const res3 = await player.chooseTarget(true).forResult()
              const target3 = res3.targets[0]
              await target3.draw(9)
              break;
          }
        }
        player.storage.tck_xiong_yi = true
      },
    },
    "tck_mou_tie_ji": {
      trigger: { player: "useCardToPlayered" },
      logTarget: "target",
      check(event, player) {
        return get.attitude(player, event.target) < 0;
      },
      filter(event, player) {
        return player !== event.target && event.card.name === "sha" && event.target.isIn();
      },
      async content(event, trigger, player) {
        const target = trigger.target
        event.target = target
        const res = await player.chooseToPSS(target).forResult()
        // 排除平局
        if (res.tie) return
        if (res.bool) {
          await player.draw(2)
          trigger.directHit.add(target)
        } else {
          await player.gainPlayerCard("he", target, true).set("target", target)
        }
      }
    },
    "tck_ren_che_yi_ti": {
      init(player, skill) {
        player.storage.tck_ren_che_yi_ti = {
          fangyu: 0,
          jingong: 0
        }
        player.addExtraEquip(skill, "tck_fang_yu_ma", true, player => !player.isTempBanned("tck_ren_che_yi_ti"));
      },
      onremove(player, skill) {
        if (player.storage.tck_ren_che_yi_ti?.fangyu > 0) {
          player.expandedSlots.equip3 -= player.storage.tck_ren_che_yi_ti.fangyu
          let fangyuNum = player.countCards("e", card => get.subtype(card) == "equip3")
          if (player.hasEnabledSlot("equip3")) {
            fangyuNum--
          }
          if (fangyuNum > player.expandedSlots.equip3) {
            player.chooseToDiscard("e", card => get.subtype(card) == 'equip3', fangyuNum - player.expandedSlots.equip3 ?? 0, true)
          }
        }
        if (player.storage.tck_ren_che_yi_ti?.jingong > 0) {
          player.expandedSlots.equip4 -= player.storage.tck_ren_che_yi_ti.jingong
          let jingongNum = player.countCards("e", card => get.subtype(card) == "equip4")
          if (player.hasEnabledSlot("equip4")) {
            jingongNum--
          }
          if (jingongNum > player.expandedSlots.equip4) {
            player.chooseToDiscard("e", card => get.subtype(card) == 'equip4', jingongNum - player.expandedSlots.equip4 ?? 0, true)
          }
        }
        player.removeExtraEquip(skill)
        player.update()
      },
      forced: true,
      charlotte: true,
      popup: false,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.type(event.card) == "equip" && (get.subtype(event.card) == "equip3" || get.subtype(event.card) == "equip4")
      },
      async content(event, trigger, player) {
        const type = get.subtype(trigger.card)
        if (!player.hasEmptySlot(type)) {
          await player.expandEquip(type)
          if (type == "equip3") {
            player.storage.tck_ren_che_yi_ti.fangyu++
          } else if (type == "equip4") {
            player.storage.tck_ren_che_yi_ti.jingong++
          }
        }
      },
      mod: {
        globalTo(from, to, distance) {
          if (to.isTempBanned("tck_ren_che_yi_ti")) {
            return;
          }
          return distance + 1;
        },
      },
    },
    "tck_qing_zhi_yan": {
      trigger: { player: "useCardToPlayered" },
      check(event, player) {
        return get.attitude(player, event.target) < 0;
      },
      filter(event, player) {
        return player !== event.target && event.card.name === "sha" && event.target.isIn();
      },
      async content(event, trigger, player) {
        const target = trigger.target
        await target.addMark('tck_qing_zhi_yan_yinji')
        if (target.countMark('tck_qing_zhi_yan_yinji') >= 3) {
          await target.loseHp(1)
          await target.removeMark('tck_qing_zhi_yan_yinji', 3)
        }
        await target.updateMark('tck_qing_zhi_yan_yinji')
      },
      subSkill: {
        "yinji": {
          sub: true,
          source: "tck_qing_zhi_yan",
          marktext: "印",
          intro: {
            name: "印记",
            content: "当前有#个印记"
          },
        },
      },
    },
    "tck_zhi_heng": {
      locked: false,
      enable: "phaseUse",
      usable: 1,
      position: "he",
      filterCard: true,
      selectCard: [1, Infinity],
      allowChooseAll: true,
      prompt: "弃置任意张牌并摸取2倍的牌",
      async content(event, trigger, player) {
        await player.draw(event.cards.length * 2);
      },
    },
    "tck_jiu_yuan": {
      trigger: { target: "taoBegin" },
      forced: true,
      filter(event, player) {
        if (event.player === player) {
          return false;
        }
        if (event.player.group !== "wu") {
          return false;
        }
        return true;
      },
      async content(event, trigger, player) {
        trigger.baseDamage = player.maxHp - player.hp
      }
    },
    "tck_jiao_zhu": {
      trigger: {
        global: "phaseZhunbei"
      },
      forced: true,
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        let res = await trigger.player.chooseToGive("h", 1, player, `请交给${get.translation(player)}一张手牌，否则流失1点体力`).forResult()
        if (!res.bool) {
          //没给
          await trigger.player.loseHp(1)
        }
      },
    },
    "tck_xiao_chou": {
      enable: "phaseUse",
      usable: 2,
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.suit(card) == 'diamond') return 2
          else if (get.suit(card) == 'club') return 1
          else if (get.suit(card) == 'spade') return -2
          else if (get.suit(card) == 'heart') return -3
          return -1
        }).forResult()
        if (get.suit(res) == 'diamond') {
          await player.draw(2)
        } else if (get.suit(res) == 'club') {
          const res1 = await player.chooseTarget(1).forResult()
          if (res1.bool) {
            await player.discardPlayerCard(res1.targets[0], true, "hej")
          }
        } else if (get.suit(res) == 'spade') {
          await player.chooseToDiscard(true, 1, "he")
        } else if (get.suit(res) == 'heart') {
          await player.loseHp(1)
        }
      },
    },
    "tck_tk_ku_rou": {
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        await player.loseHp()
        await player.draw(3)
        if (player.isPhaseUsing()) {
          player.addTempSkill(event.name + "_effect")
          player.addMark(event.name + "_effect", 1, false)
        }
      },
      subSkill: {
        effect: {
          mod: {
            targetInRange(card, player, target, now) {
              if (card.name == "sha" && get.color(card) == "red") {
                return true;
              }
            },
            cardUsable(card, player, num) {
              if (card.name == "sha") {
                return num + player.countMark("tck_tk_ku_rou_effect");
              }
            }
          },
          charlotte: true,
          onremove: true,
          trigger: { player: "useCard" },
          sourceSkill: "tck_tk_ku_rou",
          filter(event, player) {
            return event.card?.name == "sha" && get.color(event.card) == "red";
          },
          forced: true,
          async content(event, trigger, player) {
            trigger.directHit.addArray(game.players);
          },
          intro: { content: "红杀不能闪，可多出#张杀" },
          ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
              return arg?.card?.name == "sha" && get.color(arg.card) == "red";
            }
          }
        }
      },
    },
    "tck_zi_gong": {
      enable: "phaseUse",
      async content(event, trigger, player) {
        const du = game.createCard("du")
        await player.gain(du, "gain2")
        await player.discard(du)
      },
    },
    "tck_Make": {
      group: ["tck_Make_sha", "tck_Make_shan", "tck_Make_shansha", "tck_Make_jiu", "tck_Make_tao"],
      subSkill: {
        "sha": {
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard: { name: "shan" },
          viewAs: { name: "sha" },
          viewAsFilter(player) {
            if (!player.countCards("h", "shan")) {
              return false;
            }
          },
          position: "h",
          prompt: "将一张闪当杀使用或打出",
        },
        "shan": {
          enable: ["chooseToRespond", "chooseToUse"],
          filterCard: { name: "sha" },
          viewAs: { name: "shan" },
          prompt: "将一张杀当闪使用或打出",
          position: "h",
          viewAsFilter(player) {
            if (!player.countCards("h", "sha")) {
              return false;
            }
          }
        },
        "shansha": {
          unique: true,
          direct: true,
          enable: ["chooseToUse", "chooseToRespond"],
          filter(event, player) {
            return player.countCards("hs", card => get.name(card) == "shan" && get.nature(card) == "tck_shan_sha")
          },
          chooseButton: {
            dialog(event, player) {
              let list = []
              if (player.countCards("hs", card => get.name(card) == "shan" && get.nature(card) == "tck_shan_sha")) {
                list.push(["基本", "", "sha"])
                list.push(["基本", "", "shan"])
              }
              return ui.create.dialog("Make", [list, "vcard"], "hidden")
            },
            filter(button, player) {
              let name = button.link[2]
              let rawname = "shan"
              let nature = "tck_shan_sha"
              let cards = player.getCards("hs")
              let evt = _status.event.getParent()
              for (var i of cards) {
                if (
                  get.name(i, player) == rawname && get.nature(i, player) == nature &&
                  evt.filterCard(
                    {
                      name: name,
                      isCard: true,
                      cards: [i],
                    }, player, evt
                  )
                ) {
                  return true
                }
              }
              return false
            },
            check(button) {
              return _status.event.player.getUseValue({ name: button.link[2], isCard: true })
            },
            backup(links) {
              let name = links[0][2]
              return {
                popname: true,
                viewAs: { name: name, isCard: true },
                filterCard(card) {
                  return get.name(card) == "shan" && get.nature(card) == "tck_shan_sha"
                },
                ai1: () => 1
              }
            },
            prompt(links) {
              let name = links[0][2]
              return "将一张闪杀当做" + get.translation(name) + "使用或打出"
            },
          },
          ai: {
            order: 10,
            result: {
              player: 1,
            },
          },
        },
        "jiu": {
          direct: true,
          enable: ["chooseToUse", "chooseToRespond",],
          filter(event, player) {
            return player.countCards("hs", card => taoList.includes(get.name(card)))
          },
          chooseButton: {
            dialog(event, player) {
              let list = []
              for (let name of lib.inpile) {
                if (get.type(name) == "basic") {
                  if (name == "jiu" && !!lib.card.jiu['tck_nature']) {
                    list.push(["基本", "", "jiu"]);
                    for (let j of lib.card.jiu['tck_nature']) {
                      list.push(["基本", "", "jiu", j]);
                    }
                  }
                }
              }
              return ui.create.dialog("Make", [list, "vcard"]);
            },
            filter(button, player) {
              return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            backup(links, player) {
              let name = links[0][2]
              return {
                filterCard(card) {
                  return taoList.includes(get.name(card))
                },
                popname: true,
                viewAs: { name: name, nature: links[0][3] },
              }
            },
            prompt(links, player) {
              let name = links[0][2]
              return "将一张桃类基本牌当做" + get.translation(name) + "使用或打出"
            },
          },
        },
        "tao": {
          direct: true,
          enable: ["chooseToUse", "chooseToRespond",],
          filter(event, player) {
            return player.countCards("hs", card => get.name(card) == 'jiu')
          },
          chooseButton: {
            dialog(event, player) {
              let list = []
              for (let name of lib.inpile) {
                if (get.type(name) == "basic" && taoList.includes(name)) {
                  list.push(["基本", "", name]);
                }
              }
              return ui.create.dialog("Make", [list, "vcard"]);
            },
            filter(button, player) {
              return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            backup(links, player) {
              let name = links[0][2]
              return {
                filterCard(card) {
                  return get.name(card) == 'jiu'
                },
                popname: true,
                viewAs: { name: name, nature: links[0][3] },
              }
            },
            prompt(links, player) {
              let name = links[0][2]
              return "将一张酒类基本牌当做" + get.translation(name) + "使用或打出"
            },
          },
        },
      },
    },
    "tck_ling_gan": {
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        let cards = []
        let suits = []
        while (true) {
          const res = await player.judge(card => {
            if (suits.includes(get.suit(card))) return 1
            return 2
          }).forResult()
          cards.push(res.card)
          if (suits.includes(get.suit(res))) {
            break
          }
          suits.push(get.suit(res))
        }
        await player.gain(cards, "gain2")
      },
    },
    "tck_ke_nan": {
      trigger: {
        player: "useCardToPlayered"
      },
      forced: true,
      filter(event, player) {
        return event.target.sex == 'male'
      },
      async content(event, trigger, player) {
        const target = trigger.target
        await target.chooseToDiscard("he", 1, true)
      },
      group: ["tck_ke_nan_damage"],
      subSkill: {
        "damage": {
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            return event.player.sex == 'male'
          },
          async content(event, trigger, player) {
            trigger.num++
          },
        }
      },
    },
    "tck_hu_you": {
      trigger: {
        player: "damageBegin"
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.color(card) == 'red') return 1
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          await trigger.cancel()
        }
      },
      group: ["tck_hu_you_rejudge"],
      subSkill: {
        "rejudge": {
          trigger: {
            player: "judge"
          },
          check(event, player) {
            return event.judge(player.judging[0]) < 0;
          },
          prompt: "是否再判定一次？",
          async content(event, trigger, player) {
            const card = get.cards()[0];
            const next = game.cardsGotoOrdering(card);
            next.relatedEvent = trigger;
            await next;
            player.$throw(card);
            if (trigger.player.judging[0].clone) {
              trigger.player.judging[0].clone.classList.remove("thrownhighlight");
              game.broadcast((card2) => {
                if (card2.clone) {
                  card2.clone.classList.remove("thrownhighlight");
                }
              }, trigger.player.judging[0]);
              game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]));
            }
            trigger.player.judging[0] = card;
            game.log(trigger.player, "的判定牌改为", card);
            await game.cardsDiscard(trigger.player.judging[0]);
            await game.delay(2);
          }
        }
      }
    },
    "tck_shi_jie": {
      enable: "phaseUse",
      round: 1,
      usable: 1,
      filter(event, player) {
        const evt = event.getParent(3)
        return evt.name != "tck_shi_jie"
      },
      async content(event, trigger, player) {
        await player.loseHp(1)
        await player.addTempSkill("tck_shi_jie_effect", { player: "phaseJieshuAfter" })
        await player.phase("tck_shi_jie")
      },
      subSkill: {
        "effect": {
          usable: 3,
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard: true,
          position: "h",
          viewAs: { name: "sha", nature: "tck_fei_dao" },
          viewAsFilter(player) {
            if (!player.hasCards("h", card => true)) {
              return false;
            }
          },
          prompt: "将一张手牌当飞刀用",
          check(card) {
            return 4 - get.value(card);
          }
        },
      }
    },
    "tck_yue_shen_zhi_zhong": {
      trigger: { player: "useCard" },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == 'sha' && get.nature(event.card) == 'tck_fei_dao'
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.color(card) == 'black') return 1
          return -1
        }).forResult()
        if (get.color(res) == 'black') {
          trigger.directHit.addArray(game.players)
        }
      }
    },
    "tck_sha_ren_wan_ou": {
      forced: true,
      trigger: {
        player: "shaMiss"
      },
      filter(event, player) {
        return get.nature(event.card) == 'tck_fei_dao'
      },
      async content(event, trigger, player) {
        for (let t of trigger.targets) {
          await t.addMark("tck_sha_ren_wan_ou_mark")
        }
      },
      group: ["tck_sha_ren_wan_ou_lose"],
      subSkill: {
        "mark": {
          sub: true,
          sourceSkill: "tck_zhong_du",
          intro: {
            name: "钟",
            content: "当前有#个“钟”标记",
          },
          marktext: "钟"
        },
        "lose": {
          prompt: "选择一名有2个“钟”标记的玩家，令其失去2个“钟”标记并失去1点体力",
          enable: "phaseUse",
          filter(event, player) {
            return game.hasPlayer(p => p.countMark("tck_sha_ren_wan_ou_mark") >= 2)
          },
          filterTarget(card, player, target) {
            return target.countMark("tck_sha_ren_wan_ou_mark") >= 2
          },
          async content(event, trigger, player) {
            const target = event.target
            await target.removeMark("tck_sha_ren_wan_ou_mark", 2)
            await target.loseHp(1)
          }
        },
      }
    },
    "tck_skill_a": {
      trigger: { source: "damageBegin" },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == 'sha'
      },
      async content(event, trigger, player) {
        trigger.num++
      }
    },
    "tck_skill_B": {
      trigger: { player: "useCard" },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == 'sha'
      },
      async content(event, trigger, player) {
        trigger.directHit.addArray(game.players)
      }
    },
    "tck_skill_Y": {
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return Infinity
          }
        }
      }
    },
    "tck_skill_O": {
      init(player) {
        player.awakenSkill("tck_skill_a")
        player.awakenSkill("tck_skill_B")
        player.awakenSkill("tck_skill_Y")
      },
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        let result = await player
          .chooseButton([
            '你可以选择其中一个技能本回合激活',
            [[
              ["①", "a：杀伤害+1"],
              ["②", "B：杀无法闪避"],
              ["③", "Y：一回合无上限出杀"],
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await player.restoreSkill("tck_skill_a")
              break;
            case '②':
              await player.restoreSkill("tck_skill_B")
              break;
            case '③':
              await player.restoreSkill("tck_skill_Y")
              break;
          }
        }
      },
      group: ["tck_skill_O_remove"],
      subSkill: {
        "remove": {
          trigger: {
            player: "phaseZhunbeiBefore"
          },
          popup: false,
          forced: true,
          charlotte: true,
          async content(event, trigger, player) {
            await player.awakenSkill("tck_skill_a")
            await player.awakenSkill("tck_skill_B")
            await player.awakenSkill("tck_skill_Y")
          }
        }
      }
    },
    "tck_de_er_ta": {
      enable: "phaseUse",
      filterCard: true,
      position: "h",
      selectCard: -1,
      filter(event, player) {
        return player.countCards("h") && player.hasSkill("tck_skill_O") && !player.isTempBanned("tck_skill_O")
      },
      async content(event, trigger, player) {
        await player.tempBanSkill("tck_skill_O")
        await player.draw(2)
      }
    },
    "tck_kuo_rong": {
      mod: {
        maxHandcardBase(player, num) {
          return num + 2
        }
      }
    },
    "tck_xiao_yin": {
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return Infinity;
          }
        }
      }
    },
    "tck_zhan_sun": {
      trigger: { player: ["useCardEnd", "respondEnd"] },
      forced: true,
      charlotte: true,
      filter(event, player) {
        return player.countAllHistory("useCard", (evt) => get.name(evt.card) == 'sha') >= 50
      },
      async content(event, trigger, player) {
        await player.die()
      }
    },
    "tck_qiang_hua": {
      trigger: { player: ["useCardEnd", "respondEnd"] },
      forced: true,
      charlotte: true,
      filter(event, player) {
        return player.countAllHistory("useCard", (evt) => get.name(evt.card) == 'sha') >= 30 && !player.hasSkill("tck_qiang_hua_effect")
      },
      async content(event, trigger, player) {
        await player.addSkill("tck_qiang_hua_effect")
      },
      subSkill: {
        "effect": {
          sub: true,
          sourceSkill: "tck_qiang_hua",
          trigger: { source: "damageBegin" },
          forced: true,
          filter(event, player) {
            return get.name(event.card) == 'sha'
          },
          async content(event, trigger, player) {
            trigger.num++
          }
        },
      },
    },
    "tck_bei_jing": {
      mod: {
        globalFrom(from, to, distance) {
          return distance - 2
        }
      }
    },
    "tck_zhong_du": {
      forced: true,
      trigger: {
        player: "shaHit"
      },
      async content(event, trigger, player) {
        await player.addMark("tck_zhong_du_mark")
        if (player.countMark("tck_zhong_du_mark") % 5 == 0) {
          await player.loseHp(1)
        }
        // for (let t of trigger.targets) {
        //   await t.addMark("tck_zhong_du_mark")
        //   if (t.countMark("tck_zhong_du_mark") >= 5) {
        //     await t.removeMark("tck_zhong_du_mark", 5)
        //     await t.loseHp(1)
        //   }
        // }
      },
      subSkill: {
        "mark": {
          sub: true,
          sourceSkill: "tck_zhong_du",
          intro: {
            name: "中毒",
            content: "当前有#个标记",
          },
          marktext: "毒"
        }
      }
    },
    "tck_cang_dao": {
      unique: true,
      skillAnimation: true,
      limited: true,
      enable: "phaseUse",
      filterTarget(card, player, target) {
        return player != target
      },
      filter(event, player) {
        if (player.storage.tck_cang_dao) return false
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_cang_dao")
        await event.target.loseHp()
        player.storage.tck_cang_dao = true
      },
    },
    /*   "tck_kuai_su": {
        direct: true,
        trigger: {
          global: ["phaseUseBegin", "phaseUseEnd"]
        },
        filter(event, player) {
          return event.player != player && player.hasCards("h", "sha")
        },
        async content(event, trigger, player) {
          while (true) {
            if (!player.hasCards("h", "sha")) return
            const res = await player.chooseToUse("是否使用一张杀", (card) => get.name(card) == "sha").forResult()
            if (!res.bool) return
          }
        },
      }, */
    "tck_kuai_su": {
      direct: true,
      trigger: { global: ["chooseToUseBegin"] },
      filter(event, player) {
        return event.player != player && player.hasCards("h", "sha") && event.type != "respondShan"
      },
      async content(event, trigger, player) {
        await player.chooseToUse("是否使用一张杀", (card) => get.name(card) == "sha")
      },
    },
    "tck_xing_long_dan": {
      direct: true,
      enable: ["chooseToUse"],
      filter(event, player) {
        return player.countCards("h", card => get.type(card) == "basic")
      },
      chooseButton: {
        dialog(event, player) {
          let list = []
          for (let name of lib.inpile) {
            if (get.type(name) == "basic") {
              list.push([get.translation(get.type(name)), "", name]);
              if (name == "sha") {
                for (let j of lib.inpile_nature) {
                  list.push(["基本", "", "sha", j]);
                }
              }
              if (name == "shan" && !!lib.card.shan['tck_nature']) {
                for (let j of lib.card.shan['tck_nature']) {
                  list.push(["基本", "", "shan", j]);
                }
              }
              if (name == "jiu" && !!lib.card.jiu['tck_nature']) {
                for (let j of lib.card.jiu['tck_nature']) {
                  list.push(["基本", "", "jiu", j]);
                }
              }
            }
          }
          return ui.create.dialog("龙胆", [list, "vcard"]);
        },
        filter(button, player) {
          return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
        },
        backup(links, player) {
          let name = links[0][2]
          return {
            filterCard(card) {
              return get.type(card) == 'basic'
            },
            popname: true,
            viewAs: { name: name, nature: links[0][3] },
          }
        },
        prompt(links, player) {
          let name = links[0][2]
          return "将一张基本牌当做" + get.translation(name) + "使用"
        },
      },
    },
    "tck_jing_ming": {
      trigger: { player: "phaseZhunbei" },
      forced: true,
      async content(event, trigger, player) {
        for (const target of game.players) {
          if (!target.isIn()) {
            continue;
          }
          const result = await target.chooseToDiscard({
            position: "he",
            prompt: "弃置一张牌，或本回合内不能使用或打出牌",
            ai: (card) => {
              const current = _status.event.player;
              const source = _status.event.getTrigger().player;
              if (get.attitude(source, current) > 0) {
                return -1;
              }
              if (_status.event.getRand() > 0.5) {
                return 5 - get.value(card);
              }
              return -1;
            }
          }).forResult()
          if (!result.bool) {
            target.addTempSkill("tck_jing_ming_debuff", { global: "phaseJieshuAfter" });
          }
        }
      },
      subSkill: {
        "debuff": {
          sub: true,
          sourceSkill: "tck_jing_ming",
          mark: true,
          intro: { content: "本回合内不能使用或打出牌" },
          mod: {
            cardEnabled(card) {
              return false;
            },
            cardSavable(card) {
              return false;
            },
            cardRespondable(card) {
              return false;
            }
          }
        },
      },
    },
    "tck_tun_shi": {
      trigger: {
        source: "damageBegin"
      },
      forced: true,
      async content(event, trigger, player) {
        let result = await player
          .chooseButton([
            "请选择一项",
            [[
              ["①", "回复一点体力"],
              ["②", "摸2张牌"]
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await player.recover(1)
              break
            case '②':
              await player.draw(2)
              break
          }
        }
      }
    },
    "tck_kuang_bao": {
      trigger: {
        player: "damageEnd",
        target: "useCardToTarget"
      },
      forced: true,
      filter(event, player) {
        console.log(event)
        if (event.name == 'damage' && (!event.source || event.source == player)) {
          return false
        }
        if (event.name == 'useCardToTarget' && (!event.player || event.player == player)) {
          return false
        }
        return !player.hasSkill("tck_kuang_bao_effect1") || !player.hasSkill("tck_kuang_bao_effect2")
      },
      async content(event, trigger, player) {
        await player.recover(1)
        await player.addTempSkill("tck_kuang_bao_effect1", { player: "phaseJieshuAfter" })
        await player.addTempSkill("tck_kuang_bao_effect2", { player: "phaseJieshuAfter" })
      },
      subSkill: {
        "effect1": {
          mark: true,
          intro: {
            content: "造成的伤害+1"
          },
          sub: true,
          sourceSkill: "tck_kuang_bao",
          trigger: { source: "damageBegin" },
          forced: true,
          async content(event, trigger, player) {
            trigger.num++
          }
        },
        "effect2": {
          mark: true,
          intro: {
            content: "牌不能被抵消"
          },
          sub: true,
          sourceSkill: "tck_kuang_bao",
          trigger: { player: "useCard" },
          forced: true,
          async content(event, trigger, player) {
            trigger.directHit.addArray(game.players)
          }
        },
      },
    },
    "tck_ling_hun_hu_huan": {
      init(player) {
        player.storage.tck_ling_hun_hu_huan = 3
      },
      mark: true,
      intro: {
        content(storage, player) {
          return `剩余可用${player.storage.tck_ling_hun_hu_huan}次`
        }
      },
      enable: "phaseUse",
      filterCard: true,
      selectCard: -1,
      position: "h",
      filterTarget(card, player, target) {
        return player != target
      },
      filter(event, player) {
        return player.storage.tck_ling_hun_hu_huan > 0 && player.countCards("h") > 0
      },
      async content(event, trigger, player) {
        player.storage.tck_ling_hun_hu_huan--
        const target = event.target
        const targetCards = await target.getCards("h")
        await target.discard(player, targetCards)
        const meHp = player.hp
        const heHp = target.hp
        player.hp = heHp
        target.hp = meHp
        await player.update()
        await target.update()
      }

    },
    "tck_skill_shui": {
      group: ["tck_skill_shui_1", "tck_skill_shui_2"],
      subSkill: {
        "1": {
          trigger: {
            target: "shaBegin",
          },
          forced: true,
          filter(event, player) {
            return event.card.name == "sha" && get.nature(event.card) == "fire" || get.nature(event.card) == "tck_she_fire"
          },
          content() {
            trigger.cancel();
          },
        },
        "2": {
          trigger: {
            player: "phaseZhunbeiBegin"
          },
          forced: true,
          filter(event, player) {
            return player.isDamaged() && get.land('tck_land_hai') || get.land('tck_hai_di')
          },
          async content(event, trigger, player) {
            await player.recover(1)
          }
        },
      }
    },
    "tck_fei_ji": {
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
      },
      ai: {
        directHit_ai: true,
        skillTagFilter(player, tag, arg) {
          if (arg.card.name != "sha" || arg.target.countCards("h", "shan") > 1) {
            return false;
          }
        },
      },
      mod: {
        targetInRange(card) {
          if (card.name == "sha") {
            return true;
          }
        }
      }
    },
    "tck_ren_fu": {
      mark: true,
      intro: {
        content(storage, player) {
          if (player.storage.tck_ren_fu && player.storage.tck_ren_fu.isAlive()) {
            return `当前义父为：${get.translation(player.storage.tck_ren_fu)}`;
          }
          return `当前没有义父`;
        }
      },
      trigger: {
        player: "phaseZhunbei"
      },
      forced: true,
      filter(event, player) {
        return !player.storage.tck_ren_fu || !player.storage.tck_ren_fu.isAlive()
      },
      async content(event, trigger, player) {
        const res = await player.chooseTarget("请选择一名角色为“义父”", true, (card, player, target) => player != target).forResult()
        const target = res.targets[0]
        player.storage.tck_ren_fu = target
        const res1 = await player.chooseControl(["上家", "下家"], true).set('prompt', '请选择移动的位置').forResult()
        if (res1.control == '上家') {
          game.broadcastAll(
            function (target1, target2) {
              game.swapSeat(target1, target2, false, true)
            },
            player,
            target
          )
        } else if (res1.control == '下家') {
          game.broadcastAll(
            function (target1, target2) {
              game.swapSeat(target1, target2, false, true)
            },
            player,
            target.getNext()
          )
        }
      }
    },
    "tck_shi_fu": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return !!player.storage.tck_ren_fu && player.storage.tck_ren_fu.isAlive()
      },
      async content(event, trigger, player) {
        const yifu = player.storage.tck_ren_fu
        await player.line(yifu)
        await yifu.damage(2, player)
        if (player.hasCards("hs", "sha")) {
          await player.chooseToUse({
            prompt: "是否对“义父”使用一张杀？",
            filterCard: (card) => get.name(card) == 'sha',
            filterTarget: (card, player, target) => target == yifu
          })
        }
      }
    },
    "tck_shen_nu": {
      trigger: {
        player: "phaseZhunbei"
      },
      direct: true,
      async content(event, trigger, player) {
        const res = await player.chooseTarget('是否选择一名其他角色受到1点火焰伤害？', 1, (card, player, target) => player != target).forResult()
        if (res.bool) {
          const target = res.targets[0]
          await target.damage('fire', 1, player)
        }
      }

    },
    "tck_shen_wu": {
      group: ["tck_shen_wu_sha", "tck_shen_wu_shan", "tck_shen_wu_effect1", "tck_shen_wu_effect2"],
      subSkill: {
        "sha": {
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard(card) {
            return get.color(card) == 'red'
          },
          viewAs: { name: "sha" },
          viewAsFilter(player) {
            if (!player.countCards("he", (card) => get.color(card) == 'red')) {
              return false;
            }
          },
          position: "he",
          prompt: "将一张红色牌当杀使用或打出",
        },
        "shan": {
          ruleSkill: true,
          enable: ["chooseToRespond", "chooseToUse"],
          filterCard(card) {
            return get.color(card) == 'black'
          },
          viewAs: { name: "shan" },
          prompt: "将一张黑色牌当闪使用或打出",
          position: "he",
          viewAsFilter(player) {
            if (!player.countCards("he", (card) => get.color(card) == 'black')) {
              return false;
            }
          }
        },
        "effect1": {
          trigger: { player: "useCardEnd" },
          forced: true,
          filter(event) {
            return get.name(event.card) === "shan"
          },
          async content(event, trigger, player) {
            await player.draw()
          }
        },
        "effect2": {
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            if (!event.card) return
            return get.name(event.card) == 'sha' && get.color(event.card) == 'red'
          },
          async content(event, trigger, player) {
            trigger.num++
          }
        },
      },
    },
    "tck_mo_long_dan": {
      group: ["tck_mo_long_dan_sha", "tck_mo_long_dan_shan"],
      subSkill: {
        "sha": {
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard: true,
          viewAs: { name: "sha", nature: "tck_light" },
          viewAsFilter(player) {
            if (!player.countCards("he")) {
              return false;
            }
          },
          position: "he",
          prompt: "将一张牌当光杀使用或打出",
        },
        "shan": {
          ruleSkill: true,
          enable: ["chooseToRespond", "chooseToUse"],
          filterCard: true,
          viewAs: { name: "shan" },
          prompt: "将一张牌当闪使用或打出",
          position: "he",
          viewAsFilter(player) {
            if (!player.countCards("he")) {
              return false;
            }
          }
        },
      }
    },
    "tck_mo_qu": {
      intro: {
        content: "当前有个“渠”标记"
      },
      trigger: {
        player: "useCard",
      },
      filter(event, player) {
        return player.countCards("he") > 0 && taoList.includes(get.name(event.card)) || get.name(event.card) == 'jiu'
      },
      prompt: "是否制衡自己一张牌？",
      async content(event, trigger, player) {
        await player.chooseToDiscard(1, true, "he")
        await player.draw(1)
        await player.addMark("tck_mo_qu", 1)
      },
      group: ["tck_mo_qu_1", "tck_mo_qu_2"],
      subSkill: {
        "1": {
          trigger: { player: "phaseJieshuBegin" },
          prompt(event, player) {
            const num = player.countMark("tck_mo_qu")
            return "渠：是否将手牌摸至" + num + "张？";
          },
          filter(event, player) {
            return player.hasMark("tck_mo_qu")
          },
          async content(event, trigger, player) {
            const markNum = player.countMark("tck_mo_qu")
            const hNum = player.countCards("h")
            if (hNum < markNum) {
              await player.drawTo(markNum)
            }
            await player.clearMark("tck_mo_qu")
          },
        },
        "2": {
          trigger: { player: ["useCard", "respond"] },
          filter(event2, player2) {
            if (event2.card.name != "sha" && event2.card.name != "shan") {
              return false;
            }
            var target2 = lib.skill.tck_mo_qu_2.logTarget(event2, player2);
            return target2 && target2.countGainableCards(player2, "he") > 0;
          },
          logTarget(event2, player2) {
            if (event2.name == "respond") {
              return event2.source;
            }
            if (event2.card.name == "sha") {
              return event2.targets[0];
            }
            return event2.respondTo[0];
          },
          prompt2(event2, player2) {
            var target2 = lib.skill.tck_mo_qu_2.logTarget(event2, player2);
            return "获得" + get.translation(target2) + "的一张牌";
          },
          content() {
            var target2 = lib.skill.tck_mo_qu_2.logTarget(trigger, player);
            player.gainPlayerCard(target2, "he", true);
          },
        },
      }
    },
    "tck_mo_ma_shu": {
      locked: true,
      init(player, skill) {
        player.addExtraEquip(skill, "tck_bai_niao_chao_feng_qiang", true, player => !player.isTempBanned("tck_mo_ma_shu"));
      },
      onremove(player, skill) {
        player.removeExtraEquip(skill)
      },
      group: "tck_mo_ma_shu_bainiaochaofengqiang",
      subSkill: {
        "bainiaochaofengqiang": {
          nobracket: true,
          equipSkill: true,
          forced: true,
          trigger: {
            player: "useCard"
          },
          filter(event, player) {
            return get.type(event.card) == 'basic' && !player.isTempBanned("tck_mo_ma_shu")
          },
          async content(event, trigger, player) {
            await player.draw(1)
          },
          mod: {
            attackRangeBase(player2) {
              var num = lib.card?.tck_bai_niao_chao_feng_qiang?.distance?.attackFrom;
              if (typeof num != "number" || player2.isTempBanned("tck_mo_ma_shu")) {
                return;
              }
              return Math.max(player2.getEquipRange(player2.getCards("e")), 1 - num);
            }
          },
        }
      },
      mod: {
        globalTo(from, to, distance) {
          return distance + 1;
        },
        globalFrom(from, to, distance) {
          return distance - 1;
        }
      }
    },
    "tck_jie_zha_yan": {
      trigger: {
        global: "phaseZhunbei"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        const target = trigger.player
        const res = await player.judge(card => {
          if (get.suit(card) == 'club') return 1
          return -1
        }).forResult()
        if (get.suit(res) == 'club') {
          if (player.distanceTo(target) > 1) {
            const res1 = await player.chooseControl(["上家", "下家"], true).set('prompt', '请选择移动的位置').forResult()
            if (res1.control == '上家') {
              game.broadcastAll(
                function (target1, target2) {
                  game.swapSeat(target1, target2, false, true)
                },
                player,
                target
              )
            } else if (res1.control == '下家') {
              game.broadcastAll(
                function (target1, target2) {
                  game.swapSeat(target1, target2, false, true)
                },
                player,
                target.getNext()
              )
            }
          } else if (player.distanceTo(target) <= 1) {
            await target.loseHp(target.hp);
          }
        }
      },
    },
    "tck_xy_luo_yi": {
      trigger: {
        player: "phaseDrawBegin2"
      },
      filter(event, player) {
        return !event.numFixed;
      },
      direct: true,
      async content(event, trigger, player) {
        const list = ["多摸1张牌", "少摸1张牌", "取消"];
        const result = await player.chooseControl(list).set("prompt", get.prompt2("tck_xy_luo_yi")).forResult();
        if (result.control == "多摸1张牌") {
          trigger.num++
          await player.addTempSkill("tck_xy_luo_yi_1", { player: "phaseJieshuAfter" });
        } else if (result.control == "少摸1张牌") {
          trigger.num--
          await player.addTempSkill("tck_xy_luo_yi_2", { player: "phaseJieshuAfter" });
        }
      },
      subSkill: {
        "1": {
          mark: true,
          intro: {
            content: "造成的伤害-1"
          },
          sub: true,
          sourceSkill: "tck_xy_luo_yi",
          charlotte: true,
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          async content(event, trigger, player) {
            trigger.num--
          },
        },
        "2": {
          mark: true,
          intro: {
            content: "造成的伤害+1"
          },
          sub: true,
          sourceSkill: "tck_xy_luo_yi",
          charlotte: true,
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          async content(event, trigger, player) {
            trigger.num++
          },
        }
      }
    },
    "tck_feng_zhu": {
      enable: "phaseUse",
      usable: 1,
      filterTarget(card, player, target) {
        return player != target
      },
      filterCard: true,
      selectCard: -1,
      filter(event, player) {
        return player.hasCards("h")
      },
      async content(event, trigger, player) {
        await event.target.loseMaxHp(1)
      },
    },
    "tck_ji_feng": {
      enable: "phaseUse",
      filterTarget(card, player, target) {
        return player != target
      },
      filter(event, player) {
        return player.getSuitNum("he") >= 4
      },
      filterCard(card, player) {
        return !ui.selected.cards.some((cardx) => get.suit(cardx, player) == get.suit(card, player));
      },
      selectCard: 4,
      complexCard: true,
      complexSelect: true,
      async content(event, trigger, player) {
        await event.target.loseMaxHp(1)
      },
    },
    "tck_bei_shen_ming_juan_gu_zhi_ren": {
      forced: true,
      trigger: {
        source: "damageBegin"
      },
      filter(event, player) {
        return get.name(event.card) == 'sha' && event.player.maxHp <= player.maxHp
      },
      async content(event, trigger, player) {
        trigger.num++
      },
    },
    "tck_jie_bei_ge": {
      trigger: { global: "damageEnd" },
      filter(event, player) {
        return event.source && event.player.classList.contains("dead") == false && player.countCards("he");
      },
      direct: true,
      async content(event, trigger, player) {
        let result;
        const next = player.chooseToDiscard("he", get.prompt2("tck_jie_bei_ge", trigger.player));
        const check = lib.skill.beige.checkx(trigger, player);
        next.set("ai", function (card) {
          if (_status.event.goon) {
            return 8 - get.value(card);
          }
          return 0;
        });
        next.set("logSkill", "tck_jie_bei_ge");
        next.set("goon", check);
        result = await next.forResult();
        if (result.bool) {
          result = await trigger.player.judge().forResult();
        } else {
          return;
        }
        switch (result.suit) {
          case "heart":
            trigger.player.recover(trigger.num);
            break;
          case "diamond":
            trigger.player.draw(3);
            break;
          case "club":
            await trigger.source.chooseToDiscard("he", 2, true);
            break;
          case "spade":
            trigger.source.turnOver();
            break;
        }
      },
    },
    "tck_jie_duan_chang": {
      trigger: { player: "die" },
      forced: true,
      forceDie: true,
      skillAnimation: true,
      filter(event) {
        return event.source && event.source.isIn();
      },
      async content(event, trigger, player) {
        trigger.source.clearSkills(true)
      },
      logTarget: "source",
      ai: {
        maixie_defend: true,
        threaten(player, target) {
          if (target.hp == 1) {
            return 0.2;
          }
          return 1.5;
        },
        effect: {
          target(card, player, target, current) {
            if (!target.hasFriend()) {
              return;
            }
            if (target.hp <= 1 && get.tag(card, "damage")) {
              if (player.hasSkillTag("jueqing", false, target)) {
                return 3;
              }
              return [1, 0, 0, -3 * get.threaten(player)];
            }
          }
        }
      }
    },
    "tck_lie_qi": {
      forced: true,
      trigger: {
        player: "damageBegin",
        source: "damageBegin"
      },
      async content(event, trigger, player) {
        trigger.num++
      }
    },
    "tck_xi_nao": {
      enable: "phaseUse",
      filterCard(card) {
        return get.color(card) == 'red'
      },
      position: "he",
      selectCard: 2,
      filter(event, player) {
        return player.countCards("he", card => get.color(card) == 'red') >= 2
      },
      async content(event, trigger, player) {
        await player.recover(1)
        await player.drawTo(player.maxHp)
        const res = await player.chooseTarget("是否选择一名角色令其弃置所有手牌？").forResult()
        if (!res.bool) return
        const target = res.targets[0]
        await target.discard(target.getCards("h"))
      }
    },
    "tck_shi_bei": {
      trigger: { player: "damageEnd" },
      forced: true,
      charlotte: true,
      usable: 1,
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.recover(1)
      }
    },
    "tck_fen_yin": {
      group: ["tck_fen_yin_1", "tck_fen_yin_2"],
      subSkill: {
        "1": {
          locked: false,
          trigger: { player: ["useCard", "respond"] },
          frequent: true,
          filter(event, player) {
            var color2 = get.color(event.card);
            player.addTip("tck_fen_yin", "奋音 " + get.translation(color2), true);
            var evt = player.getLastUsed(1);
            if (!evt) {
              return false;
            }
            var color1 = get.color(evt.card);
            return color1 && color2 && color1 != "none" && color2 != "none" && color1 != color2;
          },
          async content(event, trigger, player) {
            player.draw("nodelay");
          }
        },
        "2": {
          locked: false,
          trigger: { player: ["useCard", "respond"] },
          frequent: true,
          filter(event, player) {
            var color2 = get.color(event.card);
            player.addTip("tck_fen_yin", "奋音 " + get.translation(color2), true);
            var evt = player.getLastUsed(1);
            if (!evt) {
              return false;
            }
            var color1 = get.color(evt.card);
            return color1 && color2 && color1 != "none" && color2 != "none" && color1 == color2 && game.hasPlayer((current) => current.hasDiscardableCards(player, "ej"))
          },
          async content(event, trigger, player) {
            const res = await player.chooseTarget(
              "是否弃置场上的一张牌",
              (card, player, target) => {
                return target.countDiscardableCards(player, "ej")
              }
            ).forResult()
            if (res.bool) {
              const target = res.targets[0]
              player.line(target);
              await player.discardPlayerCard(target, "ej", true)
            }
          }
        }
      }
    },
    "tck_kuang_gu": {
      trigger: { source: "damageSource" },
      forced: true,
      async content(event, trigger, player) {
        const options = ["摸1张牌"]
        if (player.isDamaged()) {
          options.push('回复1点体力')
        }
        const res = await player.chooseControl(options, true).set('prompt', '请选择一项').forResult()
        if (res.control == '摸1张牌') {
          await player.draw(1)
        } else if (res.control == '回复1点体力') {
          await player.recover(1)
        }
      }
    },
    "tck_qi_mou": {
      mark: true,
      skillAnimation: true,
      limited: true,
      enable: "phaseUse",
      filter(event, player) {
        if (player.storage.tck_qi_mou) return false
        return true
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_qi_mou")
        const result = await player
          .chooseNumbers(get.prompt(event.name), [{ prompt: "请选择你要失去的体力值", min: 1, max: player.getHp() }], true)
          .forResult()
        const number = result.numbers[0]
        await player.addSkill("tck_qi_mou_effect")
        await player.addMark("tck_qi_mou_effect", number)
        await player.loseHp(number)
        player.storage.tck_qi_mou = true
      },
      subSkill: {
        "effect": {
          sub: true,
          source: "tck_qi_mou",
          mark: true,
          intro: {
            content(storage, player) {
              return `出杀次数+${player.countMark("tck_qi_mou_effect")}`
            },
          },
          mod: {
            cardUsable(card, player, num) {
              if (card.name == "sha") {
                return num + player.countMark("tck_qi_mou_effect")
              }
            }
          },
        },
      },
    },
    "tck_mu_chan": {
      trigger: { player: "recoverBegin" },
      forced: true,
      charlotte: true,
      filter(event, player) {
        return taoList.includes(get.name(event.card)) && event.card.isCard
      },
      async content(event, trigger, player) {
        trigger.num++
      },
      group: ["tck_mu_chan_tao", "tck_mu_chan_ju"],
      subSkill: {
        "tao": {
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard(card) {
            return get.name(card) == "tck_card_du_tao"
          },
          position: "hs",
          viewAs: { name: "tao" },
          viewAsFilter(player) {
            if (!player.countCards("hs", "tck_card_du_tao")) {
              return false;
            }
          },
          prompt: "将一张毒桃当桃使用或打出"
        },
        "ju": {
          enable: ["chooseToUse", "chooseToRespond"],
          filterCard(card) {
            return get.name(card) == "tck_card_du_ju"
          },
          position: "hs",
          viewAs: { name: "tck_ju" },
          viewAsFilter(player) {
            if (!player.countCards("hs", "tck_card_du_ju")) {
              return false;
            }
          },
          prompt: "将一张毒橘当橘使用或打出"
        }
      }
    },
    "tck_chan_liang": {
      group: ["tck_chan_liang_init", "tck_chan_liang_wugu", "tck_chan_liang_liang"],
      subSkill: {
        "init": {
          popup: false,
          forced: true,
          charlotte: true,
          lastDo: true,
          trigger: {
            player: "phaseZhunbei"
          },
          async content(event, trigger, player) {
            await player.setMark("tck_chan_liang", 4)
          }
        },
        "wugu": {
          enable: "chooseToUse",
          filterCard(card) {
            return get.type(card) == "basic"
          },
          position: "hs",
          viewAs: { name: "wugu" },
          viewAsFilter(player) {
            if (!player.countCards("hs", card => get.type(card) == "basic")) {
              return false
            }
            if (!player.hasMark("tck_chan_liang")) {
              return false
            }
          },
          prompt: "将一张基本牌当五谷丰登使用",
          async precontent(event, trigger, player) {
            await player.removeMark("tck_chan_liang", 1)
          }
        },
        "liang": {
          enable: "chooseToUse",
          filterCard(card) {
            return get.type(card) == "basic"
          },
          position: "hs",
          viewAs: { name: "tck_card_liang" },
          viewAsFilter(player) {
            if (!player.countCards("hs", card => get.type(card) == "basic")) {
              return false
            }
            if (!player.hasMark("tck_chan_liang")) {
              return false
            }
          },
          prompt: "将一张基本牌当粮使用",
          async precontent(event, trigger, player) {
            await player.removeMark("tck_chan_liang", 1)
          }
        }
      }
    },
    "tck_si_shen": {
      enable: "phaseUse",
      filterCard: true,
      selectCard: 2,
      filter(event, player) {
        return player.countCards("h") >= 2
      },
      async content(event, trigger, player) {
        const card1 = event.cards[0]
        const card2 = event.cards[1]
        if (get.suit(card1) == get.suit(card2) || get.number(card1) == get.number(card2)) {
          await player.draw(2)
        } else {
          await player.draw(1)
        }
      }
    },
    "tck_yu_yan": {
      trigger: {
        player: "phaseJieshu"
      },
      async content(event, trigger, player) {
        const pileCards = get.cards(5, false)
        const res = await player.chooseToMove()
          .set("list", [["牌堆顶", pileCards]])
          .forResult()

        if (res.bool) {
          const cards = res.moved[0].slice(0)
          if (cards?.length) {
            cards.reverse()
            await game.cardsGotoPile(cards, "insert")
          }
        }

        await player.draw(1)
      }
    },
    "tck_shou_shu": {
      mark: true,
      intro: {
        content(storage, player) {
          if (player.storage.tck_shou_shu.size == 0) return "当前没有人做过手术"
          const players = player.storage.tck_shou_shu.keys()
          let strs = []
          for (let p of players) {
            strs.push(`${get.translation(p)}已做了${player.storage.tck_shou_shu.get(p)}次手术`)
          }
          return strs.join("<br/>")
        }
      },
      init(player) {
        player.storage.tck_shou_shu = new Map()
      },
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return player.getSuitNum("h") >= 3
      },
      filterCard(card, player) {
        return !ui.selected.cards.some((cardx) => get.suit(cardx, player) == get.suit(card, player))
      },
      selectCard: 3,
      complexCard: true,
      complexSelect: true,
      filterTarget(card, player, target) {
        return player != target && target.maxHp > (player.storage.tck_shou_shu.get(target) ? player.storage.tck_shou_shu.get(target) : 0)
      },
      async content(event, trigger, player) {
        const target = event.target
        if (!player.storage.tck_shou_shu.get(target)) {
          player.storage.tck_shou_shu.set(target, 1)
        } else {
          player.storage.tck_shou_shu.set(target, player.storage.tck_shou_shu.get(target) + 1)
        }

        if (player.storage.tck_shou_shu.get(target) == target.maxHp) {
          target.changeTckTrueMe(target, player)
        }
      },
      group: ["tck_shou_shu_effect"],
      subSkill: {
        "effect": {
          forced: true,
          trigger: {
            global: ["damageEnd", "loseHpEnd", "recoverEnd"]
          },
          filter(event, player) {
            const evtName = event.name
            const target = event.player
            if (!player.storage.tck_shou_shu.get(target)) {
              return false
            }
            if (target.hp <= 0) {
              return false
            }
            const shoushued = player.storage.tck_shou_shu.get(target)
            const num = event.num ?? 0
            let beforeHp = target.hp, afterHp = target.hp
            if (evtName == "recover") beforeHp -= num
            if (evtName == "recover" && shoushued > beforeHp) {
              return true
            }
            if (evtName == "loseHp" || evtName == "damage") {
              for (let i = num; i >= 0; i--) {
                if (shoushued > afterHp + i) {
                  return true
                }
              }
            }
            return false
          },
          async content(event, trigger, player) {
            await player.draw(1)
          }
        },
      },
    },
    "tck_yi_dao": {
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.name(event.card) == "sha"
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.suit(card) == 'diamond') return 1
          return -1
        }).forResult()
        if (get.suit(res) == 'diamond') {
          trigger.effectCount++
        }
      }
    },
    "tck_wan_jian": {
      mark: true,
      skillAnimation: true,
      limited: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        if (player.storage.tck_wan_jian) return false
        return get.name(event.card) == "sha"
      },
      async content(event, trigger, player) {
        await player.awakenSkill("tck_wan_jian")
        trigger.effectCount = 3
        player.storage.tck_wan_jian = true
      },
    },
    "tck_jian_xin": {
      trigger: {
        player: "phaseUseBegin",
      },
      round: 3,
      async content(event, trigger, player) {
        await trigger.cancel()
        await player.addTempSkill("tck_jian_xin_effect", { player: "phaseZhunbei" })
      },
      subSkill: {
        "effect": {
          sub: true,
          sourceSkill: "tck_jian_xin",
          mark: true,
          intro: {
            content: "无法被选中"
          },
          mod: {
            targetEnabled(card, player, target, now) {
              return false;
            },
          },
        },
      },
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
    "tck_r_liang_shuang": {
      group: ["tck_r_liang_shuang_hanbing", "tck_r_liang_shuang_levelUp"],
      locked: true,
      init(player, skill) {
        player.addExtraEquip(skill, "hanbing", true, player => player.countCards("e") == 0 && lib.card.hanbing);
      },
      onremove(player, skill) {
        player.removeExtraEquip(skill);
      },
      subSkill: {
        "hanbing": {
          equipSkill: true,
          noHidden: true,
          inherit: "hanbing_skill",
          filter(event, player) {
            if (!lib.skill.hanbing_skill.filter(event, player)) {
              return false;
            }
            if (player.countCards("e") > 0) {
              return false;
            }
            return true;
          },
        },
        "levelUp": {
          charlotte: true,
          forced: true,
          trigger: {
            player: "useCard"
          },
          filter(event, player) {
            return get.name(event.card) == 'hanbing' &&
              (player.countCards("e", card => get.name(card) == 'hanbing') > 0 ||
                (player.countCards("e") == 0 && player.extraEquip?.some(e => e[1] == 'hanbing')))
          },
          async content(event, trigger, player) {
            const card = trigger.card
            const cards = trigger.cards
            // 将寒冰剑移出游戏
            game.cardsGotoSpecial(cards)
            // 将极冰剑加入游戏并使用
            const jibing = await game.createCard2("tck_r_ji_bing_jian", card.suit, card.number)
            game.log(player, "将", card, "进化为", jibing)
            await player.$skill('寒冰剑！进化！')
            await player.chooseUseTarget(jibing, true)
            trigger.finish()
          }
        },
      }
    },
    "tck_r_xia_ye": {
      forced: true,
      trigger: {
        global: "gameStart"
      },
      async content(event, trigger, player) {
        const card = game.createCard('tck_land_r_xia_ye')
        await player.useCard(card)
      }
    },
    "tck_r_wu_you": {
      charlotte: true,
      trigger: {
        player: "phaseZhunbeiBefore",
      },
      async content(event, trigger, player) {
        const targets = game.players.filter(p => p != player)
        for (const target of targets) {
          if (target.countCards("hej") == 0) {
            await target.loseHp(1)
            // 可供人无忧的安眠
            await target.addSkill("tck_r_an_mian_force")
            continue
          }
          await player.gainPlayerCard("hej", target, 1, true)
          await player.chooseToGive(target, 1, `交还给${get.translation(target)}1张手牌`, "h", true)
        }
      },
    },
    "tck_r_an_mian": {
      charlotte: true,
      forced: true,
      trigger: {
        global: "roundStart"
      },
      filter(event, plaeyr) {
        // 场地是否是夏夜
        return _status.tckLand.some(land => land.name == "tck_land_r_xia_ye") || get.land("tck_land_r_xia_ye")
      },
      async content(event, trigger, player) {
        const players = game.players
        for (let p of players) {
          let res
          if (p.hasSkill("tck_r_an_mian_force")) {
            res = { bool: true, confirm: "ok" }
            await p.removeSkill("tck_r_an_mian_force")
          } else {
            res = await p.chooseBool("是否睡觉？").forResult()
          }
          if (res.bool && res.confirm == "ok") {
            await p.draw(2)
            // 获得效果
            await p.addTempSkill("tck_r_an_mian_effect", { global: "roundStart" })
          }
        }
      },
      subSkill: {
        "force": {
          mark: true,
          intro: {
            content: "下次【安眠】时你将强制睡觉"
          },
          sub: true,
          sourceSkill: "tck_r_an_mian",
          content(event, trigger, player) {
          }
        },
        "effect": {
          forced: true,
          charlotte: true,
          mark: true,
          intro: {
            content: "你已睡着，此轮无法出牌"
          },
          trigger: {
            player: ["phaseDiscardBefore"],
          },
          sub: true,
          sourceSkill: "tck_r_an_mian",
          async content(event, trigger, player) {
            await trigger.cancel()
          },
          mod: {
            cardEnabled2(card) {
              if (get.position(card) == "h") {
                return false;
              }
            },
          },
        }
      }
    },
    "tck_r_niu_lai": {
      trigger: {
        global: "phaseBefore",
        player: "enterGame"
      },
      locked: true,
      filter(event, player) {
        return game.hasPlayer(current => current != player &&
          player.differentSexFrom(current)) && (event.name != "phase" || game.phaseNumber == 0);
      },
      async cost(event, trigger, player) {
        event.result = await player
          .chooseTarget("请选择【牛来】的目标", lib.translate.tck_r_niu_lai_info, true, function (card, player, target) {
            return target != player &&
              (!player.storage.tck_r_niu_lai || !player.storage.tck_r_niu_lai != target) &&
              player.differentSexFrom(target)
          })
          .set("ai", function (target) {
            let att = get.attitude(_status.event.player, target);
            if (att > 0) {
              return att + 1;
            }
            if (att == 0) {
              return Math.random();
            }
            return att;
          })
          .set("animate", false)
          .forResult();
      },
      // logLine: false,
      async content(event, trigger, player) {
        let [target] = event.targets
        player.storage.tck_r_niu_lai = target
        const func = async (player, target) => {
          target.storage.tck_r_niu_lai_mark ??= []
          target.storage.tck_r_niu_lai_mark.add(player)
          target.storage.tck_r_niu_lai_mark.sortBySeat()
          target.markSkill("tck_r_niu_lai_mark", null, null, true)
          await target.addSkill("tck_r_niu_lai_nuqi")
          target.storage.tck_r_niu_lai_nuqi.son = player
          player.storage.tck_r_niu_lai = target
        }
        if (event.isMine()) {
          func(player, target)
        } else if (player.isOnline2()) {
          player.send(func, player, target);
        }
      },
      group: ["tck_r_niu_lai_effect1", "tck_r_niu_lai_effect2"],
      subSkill: {
        "mark": {
          sub: true,
          sourceSkill: "tck_r_niu_lai",
          mark: true,
          marktext: "妈",
          intro: {
            name: "“妈妈”",
            content: "$每受到一点伤害，你怒气值+1",
          },
        },
        "nuqi": {
          init(player) {
            player.storage.tck_r_niu_lai_nuqi = {
              son: undefined,
              num: 0
            }
          },
          sub: true,
          sourceSkill: "tck_r_niu_lai",
          mark: true,
          marktext: "怒气",
          intro: {
            name: "怒气",
            content(storage) {
              return "当前有" + storage.num + "点怒气值"
            },
          },
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            return player.storage.tck_r_niu_lai_nuqi.num > 0
          },
          async content(event, trigger, player) {
            trigger.num += player.storage.tck_r_niu_lai_nuqi.num
            player.storage.tck_r_niu_lai_nuqi.num = 0
          }
        },
        "effect1": {
          sub: true,
          sourceSkill: "tck_r_niu_lai",
          forced: true,
          trigger: {
            player: "damageEnd"
          },
          filter(event, player) {
            return !!player.storage.tck_r_niu_lai && player.storage.tck_r_niu_lai.isAlive()
          },
          async content(event, trigger, player) {
            player.storage.tck_r_niu_lai.storage.tck_r_niu_lai_nuqi.num += trigger.num
          }
        },
        "effect2": {
          sub: true,
          sourceSkill: "tck_r_niu_lai",
          mod: {
            targetEnabled(card, player, target) {
              if (game.hasPlayer(p => p == target.storage.tck_r_niu_lai) &&
                game.hasPlayer(p => p != target && p != target.storage.tck_r_niu_lai) &&
                !(player == target || player == target.storage.tck_r_niu_lai)) {
                return false
              }

            },
          },
        }
      }
    },
    "tck_r_lin_mo": {
      enable: "phaseUse",
      round: 1,
      filter(event, player) {
        return game.hasPlayer(p => p == player.storage.tck_r_niu_lai)
      },
      async content(event, trigger, player) {
        const mama = player.storage.tck_r_niu_lai
        let res = await player.chooseControl(mama.getOriginalSkills().filter(skill => skill != player.storage.tck_r_lin_mo))
          .set('prompt', '请选择一个技能学会')
          .forResult()
        await player.addTempSkill(res.control, { global: "roundEnd" })
        player.storage.tck_r_lin_mo = res.control
      }
    },
    "tck_r_yin_cang": {
      trigger: {
        player: ["phaseDiscardBefore"],
      },
      forced: true,
      content() {
        trigger.cancel()
      },
    },
    "tck_r_feng_kuang": {
      forced: true,
      trigger: {
        global: "gameStart"
      },
      async content(event, trigger, player) {
        const card = game.createCard('tck_land_r_feng_kuang_xing_qi_si')
        await player.useCard(card)
      }
    },
    "tck_r_meng_mian": {
      mark: true,
      intro: {
        content(storage, player) {
          if (storage) {
            return `当前的变身为${get.translation(storage)}`
          } return `当前没有变身`
        }
      },
      trigger: {
        player: "damageBegin"
      },
      async content(event, trigger, player) {
        let list
        const charList = Object.keys(lib.character)
        if (charList) {
          list = charList.filter(char => get.translation(char).includes('含') && char != player.name)
        }
        if (!list || list.length == 0) {
          return
        }
        const result = await player
          .chooseButton(true)
          .set("createDialog", ["请选择其中一个角色变身", [list, "character"]])
          .forResult()
        if (result?.links?.length) {
          await player.reinitCharacter(player.name, result.links[0])
          await player.addSkill('tck_r_meng_mian')
          const card = await game.createCard2('tck_r_mian_zhao', lib.suit.randomGet(), get.rand(1, 13), undefined)
          await player.gain(card, 'gain2')
          player.storage.tck_r_meng_mian = get.translation(result.links[0])
        }
      }
    },

    //============================================全局技能============================================
    // 添加语音
    "tck_send_skill_voice": {
      ruleSkill: true,
      charlotte: true,
      forced: true,
      locked: true,
      direct: true,
      silent: true,
      frequent: true,
      firstDo: true,
      popup: false,
      enable: "phaseUse",
      filter(event, player) {
        const skills = player.getSkills(false, false)
        if (skills.length == 0) return false
        let allVoiceList = []
        // 构建所有的技能：台词
        skills.forEach(skill => {
          const voiceMap = get.Audio.skill({ skill, player: player.name }).audioList
          allVoiceList.push(...voiceMap)
        })
        if (allVoiceList.length == 0) return false
        return true
      },
      async content(event, trigger, player) {
        const skills = player.getSkills(false, false)
        let allVoiceList = []
        // 构建所有的技能：台词
        skills.forEach(skill => {
          const voiceMap = get.Audio.skill({ skill, player: player.name }).audioList
          allVoiceList.push(...voiceMap)
        })
        if (allVoiceList.length == 0) return
        let options = allVoiceList.map(voice => voice.text)
        let result = await player.chooseButton(['选择一个语音播放', [options, "textbutton"]]).forResult()
        if (result.bool) {
          const skill = allVoiceList.find(voice => voice.text == result.links[0])
          if (skill.text) {
            await player.chat(skill.text)
            game.broadcastAll(file => game.playAudio(file), skill.file)
          }
        }
        player.markSkill(event.name)
      }
    },
    // 交换控制权（随从由玩家自己操作）
    "tck_swap_control": {
      firstDo: true,
      trigger: {
        player: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseToCompareBegin", "chooseButtonBegin", "chooseCardBegin", "chooseTargetBegin", "chooseCardTargetBegin", "chooseControlBegin", "chooseBoolBegin", "choosePlayerCardBegin", "discardPlayerCardBegin", "gainPlayerCardBegin", "chooseToMoveBegin", "chooseToPlayBeatmapBegin", "chooseToGiveBegin", "chooseToGuanxingBegin", "chooseButtonTargetBegin", "chooseNumbersBegin"]
      },
      forced: true,
      priority: 100,
      forceDie: true,
      popup: false,
      filter: function (event, player) {
        if (event.autochoose && event.autochoose()) {
          return false;
        }
        if (lib.filter.tckWuxieSwap(event)) {
          return false;
        }
        if (_status.auto || !player.isTckUnderControl()) {
          return false;
        }
        return true;
      },
      async content(event, trigger, player) {
        game.swapPlayerAuto(player);
      }
    },
    "tck_control_die": {
      trigger: {
        player: "dieBegin"
      },
      lastDo: true,
      charlotte: true,
      forceDie: true,
      forced: true,
      silent: true,
      popup: false,
      filter(event, player) {
        return !!player._tckTrueMe && player != player._tckTrueMe[0]
      },
      async content(event, trigger, player) {
        player.removeSkill(event.name);
      },
      onremove(player) {
        var arr = player._tckTrueMe;
        delete player._tckTrueMe;          // 先清，避免重入

        if (!Array.isArray(arr)) return;   // 统一处理 undefined，后面不再判

        // 从其他角色的真身列表里移除 player
        for (const p of arr) {
          if (p === player) continue;
          if (!Array.isArray(p._tckTrueMe)) continue;   // p._tckTrueMe 可能 undefined，必要
          const index = p._tckTrueMe.indexOf(player);
          if (index !== -1) p._tckTrueMe.splice(index, 1);
        }

        if (player !== game.me || !arr.length) return;

        var master = arr[0];
        var target;

        if (!master.isDead()) {
          // 规则1：主人活着 → 选主人
          target = master;
        } else {
          // 规则2：主人死了 → 从其他人里随机挑一个活着的
          var alive = [];
          for (var i = 0; i < arr.length; i++) {
            var q = arr[i];
            if (q === player) continue;
            if (q.isDead()) continue;
            alive.push(q);
          }
          if (alive.length) {
            target = alive[Math.floor(Math.random() * alive.length)];
          } else {
            // 规则3：全都死了 → 仍然选主人
            target = master;
          }
        }

        if (!target || target === player) return;
        if (!game.notMe) {
          game.swapPlayerAuto(target);
        } else {
          delete game.notMe;
        }
        if (_status.auto) {
          ui.click.auto();
        }
      }
    },
  },
  translate: {
    "tck_yi_dao": "一刀",
    "tck_yi_dao_info": "判定♦连砍一刀。",
    "tck_wan_jian": "万剑",
    "tck_wan_jian_info": "[限]一刀砍三下。",
    "tck_jian_xin": "剑心",
    "tck_jian_xin_info": "不出牌无法被选中，三回合剑心失效",
    "tck_shou_shu": "手术",
    "tck_shou_shu_info": "出牌阶段限一次，你可以弃置3种花色，选择一人，记录其一体力上限，若其体力上限均被你记录，则其回合永久由你操作，其被记录体力上限的体力值改变后，你摸1张牌。",
    "tck_si_shen": "思慎",
    "tck_si_shen_info": "出牌阶段，你可弃2张牌，然后摸1张牌，若你弃的牌花色或点数一致，则你额外摸1张。",
    "tck_yu_yan": "预言",
    "tck_yu_yan_info": "回合结束，你可观看牌堆顶5张牌，然后你可改变位置，然后你摸1张牌。",
    "tck_mu_chan": "亩产",
    "tck_mu_chan_info": "锁定技，你的非转化桃类基本牌回复量+1，你的毒桃可当桃，你的毒橘可当橘。",
    "tck_chan_liang": "产粮",
    "tck_chan_liang_info": "你可以将基本牌当五谷丰登或粮使用。（每回合限4次）",
    "tck_kuang_gu": "狂骨",
    "tck_kuang_gu_info": "你造成伤害后可选择一项：<br/>①摸1张牌。<br/>②回复1点体力。",
    "tck_qi_mou": "奇谋",
    "tck_qi_mou_info": "限定技，你可流失X点体力，然后你本局游戏每轮你的出杀次数+X。",
    "tck_fen_yin": "奋音",
    "tck_fen_yin_info": "你打出或使用的牌若与你打出或使用的上一张牌的颜色：<br/>①不同，你摸一张牌。<br/>②相同，你弃置场上一张牌。",
    "tck_shi_bei": "矢北",
    "tck_shi_bei_info": "锁定技，每名角色回合内限一次，你受到伤害后，你回复一点体力。",
    "tck_lie_qi": "猎奇",
    "tck_lie_qi_info": "你受到的伤害+1，你造成的伤害+1。",
    "tck_xi_nao": "洗脑",
    "tck_xi_nao_info": "你可以弃2张红牌，你回复1体力并将手牌摸至上限，然后选择一角色弃所有手牌。",
    "tck_jie_bei_ge": "悲歌",
    "tck_jie_bei_ge_info": "对受伤者，弃一张牌判定，♥回复伤害量，♦摸3张（自己），♣弃二张（来源），♥（翻面对方）。",
    "tck_jie_duan_chang": "断肠",
    "tck_jie_duan_chang_info": "你死，对手没技能。",
    "tck_feng_zhu": "风祝",
    "tck_feng_zhu_info": "丢弃所有手牌，对敌方生命上限造成1点伤害。[限1次]",
    "tck_ji_feng": "祭风",
    "tck_ji_feng_info": "丢弃4个相同花色，对敌方生命上限造成1点伤害。",
    "tck_bei_shen_ming_juan_gu_zhi_ren": "被神明眷顾之人",
    "tck_bei_shen_ming_juan_gu_zhi_ren_info": "敌方生命上限若小于等于自己，杀伤害+1。",
    "tck_bei_shen_ming_juan_gu_zhi_ren_append": "PS.所有生命上限损伤无法回复。",
    "tck_xy_luo_yi": "裸衣",
    "tck_xy_luo_yi_info": "你可以选择1项：①多摸1张牌，本回合造成伤害-1.<br/>②少摸1张牌，本回合造成伤害+1。",
    "tck_jie_zha_yan": "眨眼",
    "tck_jie_zha_yan_info": "每名角色回合开始时需判定，若结果为梅花，则：<br/>①若其与你距离为1，则你令其濒死。<br/>②若其与你距离不为1，则你移动至其上家或下家。",
    "tck_mo_long_dan": "龙胆",
    "tck_mo_long_dan_info": "你任意一张牌都可光杀或闪。",
    "tck_mo_qu": "渠",
    "tck_mo_qu_info": "你使用桃或酒可以制衡自己一张牌得到渠，回合结束可以摸至和渠一样的牌，可以选是否，用闪或杀得对手一张牌。",
    "tck_mo_ma_shu": "马术",
    "tck_mo_ma_shu_info": "你偷到了吕布的马，距离-1，又偷到了马腾的马，距离+1。自己带百鸟朝凤枪。",
    "tck_mo_ma_shu_bainiaochaofengqiang": "百鸟朝凤枪",
    "tck_shen_nu": "神怒",
    "tck_shen_nu_info": "回合开始，你选择一名其它玩家受到1点火焰伤害。",
    "tck_shen_wu": "神武",
    "tck_shen_wu_info": "你可以将红色牌当杀，黑色牌当闪，你使用闪后摸1张牌，你的红色杀伤害+1。",
    "tck_fei_ji": "飞戟",
    "tck_fei_ji_info": "你的杀无距离限制，你的杀需2张闪抵消。",
    "tck_ren_fu": "认父",
    "tck_ren_fu_info": "回合开始，若你没义父，你选择一人为义父，你选择移至其上家或下家。",
    "tck_shi_fu": "弑父",
    "tck_shi_fu_info": "出牌阶段限一次，你对义父造成2点伤害，然后可以对其用一张杀。",
    "tck_ling_hun_hu_huan": "灵魂召唤",
    "tck_ling_hun_hu_huan_info": "丢弃所有手牌选择1名角色，丢弃其所有手牌，并互换血量。一场游戏限X次。（X指游玩人数）",
    "tck_skill_shui": "水",
    "tck_skill_shui_info": "火杀对自己无效，在海与海底每回合回1滴体力。",
    "tck_kuang_bao": "狂暴",
    "tck_kuang_bao_info": "当有其他玩家对你使用牌或对你造成伤害后，你获得效果，你回复1点体力，你造成的伤害+1，你的牌不能被抵消，效果于你下个回合结束失效。",
    "tck_jing_ming": "警鸣",
    "tck_jing_ming_info": "回合开始时，你令所有人选择弃1张牌，否则于你回合不能打出牌。",
    "tck_tun_shi": "吞食",
    "tck_tun_shi_info": "你造成伤害时选择一项：<br/>①回复一点体力。<br/>②摸2张牌。",
    "tck_xing_long_dan": "龙胆",
    "tck_xing_long_dan_info": "你可将基本牌当作任意基本牌使用。",
    "tck_kuo_rong": "扩容",
    "tck_kuo_rong_info": "增加两张手牌上线。",
    "tck_xiao_yin": "消音",
    "tck_xiao_yin_info": "无声无息出杀，无限使用。",
    "tck_zhan_sun": "战损",
    "tck_zhan_sun_info": "出过50张杀爆废。（直接死亡）",
    "tck_qiang_hua": "强化",
    "tck_qiang_hua_info": "出过30张杀，杀伤害+1。",
    "tck_bei_jing": "倍镜",
    "tck_bei_jing_info": "拥有4倍镜，与敌人距离-2。",
    "tck_zhong_du": "中毒",
    "tck_zhong_du_info": "每张杀命中得标记，5个标记失去1点体力。",
    "tck_cang_dao": "藏刀",
    "tck_cang_dao_info": "对敌方一笑，捅一刀，扣他一点体力。[限]",
    "tck_kuai_su": "快速",
    "tck_kuai_su_info": "回合外出杀。",
    "tck_skill_a": "a",
    "tck_skill_a_info": "杀伤害+1。",
    "tck_skill_B": "B",
    "tck_skill_B_info": "杀无法闪避。",
    "tck_skill_Y": "Y",
    "tck_skill_Y_info": "一回合无上限出杀。",
    "tck_skill_O": "O",
    "tck_skill_O_info": "一回合只能在【a】【B】【Y】中选1个技能。",
    "tck_de_er_ta": "德尔塔",
    "tck_de_er_ta_info": "丢弃所有手牌，在1回合内失去【O】，然后摸2张牌。",
    "tck_shi_jie": "世界",
    "tck_shi_jie_info": "限1次，扣1点体力额外获得1个回合，期间可以把所有手牌当为飞刀。（只能用3次）",
    "tck_yue_shen_zhi_zhong": "月神之钟",
    "tck_yue_shen_zhi_zhong_info": "飞刀进行判定，为黑则不能闪避。",
    "tck_sha_ren_wan_ou": "杀人玩偶",
    "tck_sha_ren_wan_ou_info": "飞刀被闪则对手获得1个“危”标记，2个“危”可以使对手扣1点体力。",
    "tck_ke_nan": "克男",
    "tck_ke_nan_info": "你对男性用牌其需弃1张牌，你对男性造成伤害+1。",
    "tck_hu_you": "护佑",
    "tck_hu_you_info": "受到伤害判定，若为红色，取消之，你可以判定2次。",
    "tck_Make": "Make",
    "tck_Make_info": "你的杀可当闪用，你的闪可当杀用，你的闪杀可当杀或闪用，你的桃类基本牌可当酒类基本牌用，反之也可用。",
    "tck_ling_gan": "灵感",
    "tck_ling_gan_info": "出牌阶段限一次，你可判定，直至出现相同花色为止，你获得本次判定所有判定牌。",
    "tck_tk_ku_rou": "苦肉",
    "tck_tk_ku_rou_info": "扣一点体力得3张牌，红杀不能闪，可多出一张杀。（限一次一回合）",
    "tck_zi_gong": "自功",
    "tck_zi_gong_info": "自己产出一张毒，并喝下。",
    "tck_jiao_zhu": "教主",
    "tck_jiao_zhu_info": "其他玩家回合开始时需交给你1张手牌，否则流失1点体力。",
    "tck_xiao_chou": "小丑",
    "tck_xiao_chou_info": "出牌阶段限2次，你判定：若为♦，摸2张牌，若为♣，弃1人1张牌。若为♠，你弃1张牌，若为♥，你流失1点体力。",
    "tck_zhi_heng": "制衡",
    "tck_zhi_heng_info": "出牌阶段限一次，你可以弃置任意张牌，然后摸取2倍的牌。",
    "tck_jiu_yuan": "救援",
    "tck_jiu_yuan_info": "其他吴势力角色对你用桃时，回复至满体力。",
    "tck_ren_che_yi_ti": "人车一体",
    "tck_ren_che_yi_ti_info": "开局自带+1马，可以叠加许多马。",
    "tck_qing_zhi_yan": "青之炎",
    "tck_qing_zhi_yan_info": "每杀对手1次，可以叠加印记，叠3次对手扣1点体力。",
    "tck_mou_tie_ji": "铁骑",
    "tck_mou_tie_ji_info": "你的杀指定目标后，可选择与目标进行猜拳，若你赢，你摸2张牌且此杀不可被闪避，若你输，你获得其1张牌。",
    "tck_xiong_yi": "雄异",
    "tck_xiong_yi_info": "限定技，出牌阶段，你可以选择一项：<br/>①令三人各摸3张牌。<br/>②令一人摸3张牌，一人摸6张牌。<br/>③令一人摸9张牌。",
    "tck_wei_shan": "伪善",
    "tck_wei_shan_info": "出现阶段限一次，你可弃1张手牌，令一其他人回复一点体力，然后其选择一项：<br/>①流失2点体力。<br/>②弃至少2张牌。",
    "tck_jiao_huan": "交换",
    "tck_jiao_huan_info": "限定技，你可将体力扣至1，然后选择1人，你与其交换体力值，体力上限和将牌，然后其摸X张牌。（X为你与其体力值之差）",
    "tck_huai_bao_xi_sheng_de_zha_dan": "怀抱牺牲的炸弹",
    "tck_huai_bao_xi_sheng_de_zha_dan_info": "此卡被破坏时给予对面1点体力流失并且对手只能在濒死时治疗，随后无法再次召唤。",
    "tck_cao_zong_zhe_pl": "操纵者",
    "tck_cao_zong_zhe_pl_info": "此卡在场时无法攻击上海和小爱。",
    "tck_cao_zong_zhe_sh": "操纵者",
    "tck_cao_zong_zhe_sh_info": "此卡未破坏之前无法攻击小爱。",
    "tck_ren_ou_shi_jie": "人偶视界",
    "tck_ren_ou_shi_jie_info": "摸牌限1次，指定1个颜色，获得至那颜色不同之前的牌，不影响摸牌。",
    "tck_mu_yu_he_feng": "沐浴和风",
    "tck_mu_yu_he_feng_info": "此卡被破坏可以牌堆摸4张牌。",
    "tck_peng_lai_ren_ou": "蓬莱人偶",
    "tck_peng_lai_ren_ou_info": "小爱丢弃所有手牌召唤。",
    "tck_shang_hai_ren_ou": "上海人偶",
    "tck_shang_hai_ren_ou_info": "小爱丢弃所有装备区牌召唤。",
    "tck_qi_se_ren_ou_shi": "七色人偶使",
    "tck_qi_se_ren_ou_shi_info": "蓬莱和上海有着自己的回合和手牌并且蓬莱上海未被破坏无法攻击小爱。",
    "tck_xin_ruan_2": "心软",
    "tck_xin_ruan_2_info": "获得心软角色的一张牌。",
    "tck_xin_ruan_mark": "心软",
    "tck_mai_meng": "卖萌",
    "tck_mai_meng_info": "让对手心软（标记），下不下得去下还是看对手。",
    "tck_sa_jiao": "撒娇",
    "tck_sa_jiao_info": "让对手心软（标记），有概率让对手给你两张牌，给不给还得看对手。",
    "tck_ji_suan_ji": "计算机",
    "tck_ji_suan_ji_info": "可以观察对手所有手牌。",
    "tck_shi_shen2": "式神",
    "tck_shi_shen2_info": "舍弃2张（同花色）牌可以召唤式神橙。",
    "tck_xin_ruan": "心软",
    "tck_xin_ruan_info": "对于有心软（标记）的对手，伤害+1或每回合摸对手1张牌。",
    "tck_jian_xi": "间隙",
    "tck_jian_xi_info": "锦囊没有距离限制。",
    "tck_shi_shen": "式神",
    "tck_shi_shen_info": "舍弃3张同花色牌召唤式神八云蓝。",
    "tck_jie_jie": "结界",
    "tck_jie_jie_info": "结界内双方杀无距离限制。",
    "tck_dong_mian": "冬眠",
    "tck_dong_mian_info": "1回合不抽牌不出牌则可回复1点体力，4回合1次。",
    "tck_jie_feng": "解封",
    "tck_jie_feng_info": "回合开始时，你可以弃1张牌，然后你本回合伤害+1。",
    "tck_mian_bao": "面包",
    "tck_mian_bao_info": "出牌阶段限一次，你可将1张牌当“面包”使用。（面包：回复1体力并摸2张牌，不可在濒死时使用）",
    "tck_jian_shen": "健身",
    "tck_jian_shen_info": "出牌阶段限一次，你可以自减一点体力，然后选择一项：①体力上限+1，<br/>②摸3张牌。③回复一点体力并摸1张牌。",
    "tck_quan_ji": "拳击",
    "tck_quan_ji_info": "出牌阶段一次，你选择一人进行拼点，若你赢，你摸其一张牌并对其造成一点伤害，若你输，其弃置你一张牌。",
    "tck_dan_chun": "单纯",
    "tck_dan_chun_info": "锁定技，你被牌指定为目标时判定，若为黑色，你无法响应此牌，若为红色，来源需弃1张牌，否则该牌失效。",
    "tck_xin_shan": "心善",
    "tck_xin_shan_info": "出牌阶段限一次，你令一人选择一项，摸2张牌或回复1点体力。",
    "tck_rkshs_xin_shan": "心善",
    "tck_rkshs_xin_shan_info": "你对体力为1的角色杀伤害-1，若你体力为3或以下，你受到的伤害-1。",
    "tck_jiu_jie": "纠结",
    "tck_jiu_jie_info": "你造成或受到伤害时可将此伤害改为体力流失，然后你需判定：若为红色，你摸1张牌并回复1点体力，若为黑色，你弃一张牌。",
    "tck_yin_ka": "印卡",
    "tck_yin_ka_info": "手上的卡可以随意更换，整局游戏限3次。",
    "tck_ao_xi_li_si": "奥西里斯",
    "tck_ao_xi_li_si_info": "与对手距离永远+1。",
    "tck_ling_hun_chong_ji": "灵魂冲击",
    "tck_ling_hun_chong_ji_info": "可以观察牌顶3张牌并改变位置，以及2回合1次观察对手所有手牌。",
    "tck_ling_hun_chong_ji_watch_info": "观察对手所有手牌。",
    "tck_jian_lai": "剑来",
    "tck_jian_lai_info": "弃置两张牌当万箭齐发（无限）。",
    "tck_pai_lai": "牌来",
    "tck_pai_lai_info": "场上死亡一人摸三张。",
    "tck_shi_yong": "恃勇",
    "tck_shi_yong_info": "你受到红牌伤害后，你摸1张牌，你受到伤害若大于1，则来源摸1张牌，然后你摸X张牌。<br/>（X为伤害量减一）。",
    "tck_jing_ce": "精策",
    "tck_jing_ce_info": "回合结束，若你于回合内使用了X张牌，则你摸X张牌，然后执行一个额外的出牌阶段。",
    "tck_chi_shou_dian_tong": "吃手电筒",
    "tck_chi_shou_dian_tong_info": "你回血时，你摸2张牌，然后你视为对全场使用光杀。",
    "tck_xia_si_ren": "吓死人",
    "tck_xia_si_ren_info": "你受到伤害，可以吓人，判定，若为黑桃，对一角色造成2点伤害。",
    "tck_send_skill_voice": "技能语音",
    "tck_tian_nan_men": "南门",
    "tck_tian_nan_men_info": "手上任意一张牌当南门无限次数。",
    "tck_??": "??",
    "tck_??_info": "????????",
    "tck_tao_wa": "套娃",
    "tck_tao_wa_info": "锁定技，你从将牌堆内抽三张将牌选一个替换本将牌进行游戏。",
    "tck_r_meng_mian": "蒙面",
    "tck_r_meng_mian_info": "受到伤害时，可以将自己变身成任意一个名字中带有“含”字的角色，随后获得宝物面罩。面罩无作用，可现实生活中佩戴。",
    "tck_r_niu_lai": "牛来",
    "tck_r_niu_lai_info": "游戏开始时，选择一名异性角色为[妈妈]，若场上存在其他角色，除你和[妈妈]外的单体角色技能或牌无法指定[婺城雙傑]为目标。[妈妈]每受到一点伤害，怒气值+1，下一次伤害增加怒气值数量的值（可叠加）。",
    "tck_r_lin_mo": "临摹",
    "tck_r_lin_mo_info": "每轮限一次，学会[妈妈]的任意一个技能持续到本轮结束，不能连续临摹同一个技能。",
    "tck_r_yin_cang": "隐藏",
    "tck_r_yin_cang_info": "天意的大手发力了，该角色没有弃牌阶段，喜欢吃奥尔良鸡腿堡，或许配合场地会发挥奇效。",
    "tck_r_feng_kuang": "疯狂",
    "tck_r_feng_kuang_info": "场地魔法疯狂星期四，默认今天是星期四，玩家可以丢弃各色手牌来获得，♥香辣鸡腿堡，出杀伤害+1；♦吮指原味鸡，牌堆顶摸一张牌；♣老北京鸡肉卷，出杀要两张闪；♠奥尔良鸡腿堡，好吃。拥有[妈妈]标记的玩家可以帮[婺城双杰]代购，且妈妈怒气值+1。",
    "tck_r_an_mian": "安眠",
    "tck_r_an_mian_info": "若场地为夏夜时可以发动，所有玩家可以选择本轮是否睡觉，睡觉的玩家摸两张牌结束回合，不需要丢弃手牌，此轮也无法出牌。",
    "tck_r_wu_you": "无忧",
    "tck_r_wu_you_info": "<b>锁定技</b>，回合开始前，从每名玩家手牌，区域中摸1张牌，并从手牌中选择1张牌还给每名玩家。若没有牌的玩家扣1点体力，并且下轮强制安眠。",
    "tck_r_liang_shuang": "凉爽",
    "tck_r_liang_shuang_info": "<b>锁定技</b>，没有其他装备的情况下视为装备[寒冰剑]，该装备无法离开此角色。若装备第二把[寒冰剑]的情况下进化为[极冰剑]，攻击距离4，该装备可以被移动，拥有该装备的玩家只可被火或光属性造成伤害，造成伤害时额外丢弃对手一张手牌，若无法丢弃手牌则此伤害+1。",
    "tck_r_xia_ye": "夏夜",
    "tck_r_xia_ye_info": "<b>场地技</b>，默认现在时间为21点。在夜晚所有无属性伤害攻击前判定，若为1-4则命中攻击对象左手边的玩家，若为5-8则命中指定玩家，若为9-Q则命中攻击对象右手边玩家，若为K则命中自己。",
    "tck_zhan": "斩",
    "tck_zhan_info": "你的杀视为砍<br/>砍命中后让对手选择1项：<br/>①弃2张牌。<br/>②额外扣1滴血。",
    "tck_chu_zi": "厨子",
    "tck_chu_zi_info": "你的锦都可视为桃园结义。",
    "tck_ban_ren_ban_ling": "半人半灵",
    "tck_ban_ren_ban_ling_info": "限定技，濒死使用失去【斩】，回复至满。",
    "tck_nan_men": "南门",
    "tck_nan_men_info": "基本牌当南蛮入侵（限3次）。",
    "tck_men": "门",
    "tck_men_info": "杀入需判定为黑色。",
    "tck_bao_nu": "暴怒",
    "tck_bao_nu_info": "一回合一次，伤害翻倍，无法闪避，下回合无法出牌。",
    "tck_feng_kuang_zuan_shi": "疯狂钻石",
    "tck_feng_kuang_zuan_shi_info": "每回合可回复一颗勾玉，若到上限损失2颗勾玉。",
    "tck_fa_xing": "发型",
    "tck_fa_xing_info": "对手装备武器可以免疫一切伤害。",
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
    "tck_dang_xian_info": "你回合开始前额外获得一个出牌阶段，你可于此出牌阶段视为使用一张杀。",
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