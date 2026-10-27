import { lib, game, get, _status, ui } from "../../../../noname.js";
export const r_cards = {
  card: {
    "tck_r_ji_bing_jian": {
      fullskin: true,
      image: "ext:TCK/imgs/cards/tck_r_ji_bing_jian.png",
      type: "equip",
      subtype: "equip1",
      distance: { attackFrom: -3 },
      skills: ["tck_r_ji_bing_jian_skill_1", "tck_r_ji_bing_jian_skill_2"]
    },
    "tck_r_mian_zhao": {
      image: "ext:TCK/imgs/cards/tck_r_mian_zhao.png",
      fullskin: true,
      type: "equip",
      subtype: "equip5",
    },
    "tck_land_r_feng_kuang_xing_qi_si": {
      image: "ext:TCK/imgs/cards/tck_land_r_feng_kuang_xing_qi_si.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_land_r_feng_kuang_xing_qi_si")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_land_r_xia_ye": {
      image: "ext:TCK/imgs/cards/tck_land_r_xia_ye.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_land_r_xia_ye")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
  },
  skill: {
    "tck_land_r_feng_kuang_xing_qi_si_tckland_skill": {
      ruleSkill: true,
      enable: "phaseUse",
      filter(event, player) {
        return player.countCards("h") > 0
      },
      async content(event, trigger, player) {
        let res1, res2
        let dscdCard = []
        if (!!player.storage.tck_r_niu_lai) {
          // 让“妈妈”是否弃牌
          const mama = player.storage.tck_r_niu_lai
          res1 = await mama.chooseToDiscard(`是否弃置一张手牌，为${get.translation(player)}买单`, "h", [1, Infinity]).forResult()
          if (res1.bool) {
            dscdCard = dscdCard.concat(res1.cards)
            mama.storage.tck_r_niu_lai_nuqi.num++
          }
        }
        res2 = await player.chooseToDiscard("h", [1, Infinity]).forResult()
        if (!res2.bool) {
          return
        }
        dscdCard = dscdCard.concat(res2.cards)
        for (let card of dscdCard) {
          const suit = get.suit(card)
          if (suit == 'heart') {          // ♥
            if (!player.hasSkill('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_heart')) {
              await player.addTempSkill('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_heart', { player: "phaseJieshuAfter" })
            }
            await player.addMark('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_heart', 1)
          } else if (suit == 'spade') {   // ♠
            await game.delay(1)
            await player.chat('好吃！')
            await game.delay(2)
          } else if (suit == 'club') {    // ♣
            if (!player.hasSkill('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_club')) {
              await player.addTempSkill('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_club', { player: "phaseJieshuAfter" })
            }
          } else if (suit == 'diamond') { // ♦
            // 强制从牌堆顶摸一张牌，不能直接用draw()
            const cards = await get.cards(1)
            await player.gain(cards, 'draw')
          }
        }
      },
      subSkill: {
        "heart": {
          intro: {
            name: "香辣鸡腿堡",
            content: "出杀伤害+#",
          },
          sub: true,
          sourceSkill: "tck_land_r_feng_kuang_xing_qi_si_tckland_skill",
          ruleSkill: true,
          onremove(player, skill) {
            player.clearMark(skill, false)  // 失去本技能直接清空标记
          },
          forced: true,
          trigger: {
            source: "damageBegin"
          },
          filter(event, player) {
            return event.card?.name == "sha" && player.hasMark('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_heart')
          },
          async content(event, trigger, player) {
            trigger.num += player.countMark('tck_land_r_feng_kuang_xing_qi_si_tckland_skill_heart')
          }
        },
        "club": {
          mark: true,
          intro: {
            name: "老北京鸡肉卷",
            content: "出杀要两张闪",
          },
          sub: true,
          sourceSkill: "tck_land_r_feng_kuang_xing_qi_si_tckland_skill",
          ruleSkill: true,
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
        }
      }
    },
    "tck_land_r_xia_ye_tckland_skill": {
      ruleSkill: true,
      trigger: {
        source: "damageBefore",
      },
      forced: true,
      filter(event, player) {
        return !event.hasNature()
      },
      async content(event, trigger, player) {
        const target = trigger.player
        const res = await player.judge(card => {
          if (get.number(card) >= 1 && get.number(card) <= 4) return 0
          if (get.number(card) >= 5 && get.number(card) <= 8) return 1
          if (get.number(card) >= 9 && get.number(card) <= 12) return 0
          if (get.number(card) == 13) return -1
        }).forResult()
        const resNumber = get.number(res)
        if (resNumber >= 1 && resNumber <= 4) {
          trigger.player = target.getPrevious()
        } else if (resNumber >= 5 && resNumber <= 8) {
          const t = await player.chooseTarget(true).forResult()
          trigger.player = t.targets[0]
        } else if (resNumber >= 9 && resNumber <= 12) {
          trigger.player = target.getNext()
        } else if (resNumber === 13) {
          trigger.player = player
        }
      }
    },
    "tck_r_ji_bing_jian_skill_1": {
      equipSkill: true,
      forced: true,
      trigger: { player: "damageBegin" },
      filter(event) {
        return event.nature != 'fire' && event.nature != 'tck_light'
      },
      logTarget: "player",
      async content(event, trigger, player) {
        await trigger.cancel()
      },
    },
    "tck_r_ji_bing_jian_skill_2": {
      equipSkill: true,
      trigger: { source: "damageBegin2" },
      logTarget: "player",
      async content(event, trigger, player) {
        const target = trigger.player
        const cardNum = await target.countCards("h") > 0
        if (cardNum > 0) {
          await player.discardPlayerCard("h", target, true)
        } else {
          trigger.num++
        }
      },
    },
  },
  translate: {
    "tck_land_r_feng_kuang_xing_qi_si": "疯狂星期四",
    "tck_land_r_feng_kuang_xing_qi_si_info": "场地效果：默认今天是星期四，玩家可以丢弃各色手牌来获得，♥香辣鸡腿堡，出杀伤害+1；♦吮指原味鸡，牌堆顶摸一张牌；♣老北京鸡肉卷，出杀要两张闪；♠奥尔良鸡腿堡，好吃。",
    "tck_land_r_feng_kuang_xing_qi_si_tckland_skill": "疯狂星期四",
    "tck_land_r_feng_kuang_xing_qi_si_tckland_skill_info": "默认今天是星期四，玩家可以丢弃各色手牌来获得，♥香辣鸡腿堡，出杀伤害+1；♦吮指原味鸡，牌堆顶摸一张牌；♣老北京鸡肉卷，出杀要两张闪；♠奥尔良鸡腿堡，好吃。",
    "tck_land_r_xia_ye": "夏夜",
    "tck_land_r_xia_ye_info": "场地效果：默认现在时间为21点。在夜晚所有无属性伤害攻击前判定，若为1-4则命中攻击对象左手边的玩家，若为5-8则命中指定玩家，若为9-Q则命中攻击对象右手边玩家，若为K则命中自己。",
    "tck_land_r_xia_ye_tckland_skill": "夏夜",
    "tck_land_r_xia_ye_tckland_skill_info": "默认现在时间为21点。在夜晚所有无属性伤害攻击前判定，若为1-4则命中攻击对象左手边的玩家，若为5-8则命中指定玩家，若为9-Q则命中攻击对象右手边玩家，若为K则命中自己。",
    "TCK_R": "TCK R",
    "tck_r_ji_bing_jian": "极冰剑",
    "tck_r_ji_bing_jian_info": "你只可被火或光属性造成伤害，造成伤害时额外丢弃对手一张手牌，若无法丢弃手牌则此伤害+1。",
    "tck_r_ji_bing_jian_skill_1": "极冰剑",
    "tck_r_ji_bing_jian_skill_2": "极冰剑",
    "tck_r_ji_bing_jian_skill_2_info": "额外丢弃对手一张牌，若无法丢弃手牌则此伤害+1。",
    "tck_r_mian_zhao": "面罩",
    "tck_r_mian_zhao_info": "无作用。",
  },
  list: [
  ],
}

export default r_cards