import { lib, game, get, _status, ui } from "../../../../noname.js";
export const r_skills = {
  skill: {
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
  },
  translate: {
    "tck_r_ji_rou": "肌肉",
    "tck_r_ji_rou_info": "<b>锁定技</b>，你的[杀]需要两张[闪]才能抵消。",
    "tck_r_you_huo": "诱惑",
    "tck_r_you_huo_info": "其他玩家回合开始时，其需弃置一张牌，否则其于回合内无法对你使用牌。",
    "tck_r_fu_xin": "负心",
    "tck_r_fu_xin_info": "出牌阶段限一次，你每减少一点体力上限，你就可以执行下述效果：你从牌堆顶一直展示牌堆顶的一张牌，若为♥，你获得之并停止展示，然后将其余展示放回牌堆底并将牌堆洗牌。",
    "tck_r_hua_tian": "花天",
    "tck_r_hua_tian_info": "出牌阶段限一次，你可以获得一名女性角色的所有手牌，然后你获得技能【中毒】。",
    "tck_r_zhong_du": "中毒",
    "tck_r_zhong_du_info": "锁定技，回合开始时，你失去一点体力上限并失去技能【中毒】。",
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
  }
}
export default r_skills