import { lib, game, get, _status, ui } from "../../../noname.js";
export const r_cards = {
  card: {
    "tck_ji_bing_jian": {
      fullskin: true,
      image: "ext:TCK/imgs/cards/tck_ji_bing_jian.png",
      type: "equip",
      subtype: "equip1",
      distance: { attackFrom: -3 },
      skills: ["tck_ji_bing_jian_skill_1", "tck_ji_bing_jian_skill_2"]
    },
  },
  skill: {
    "tck_ji_bing_jian_skill_1": {
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
    "tck_ji_bing_jian_skill_2": {
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
    "TCK_R": "TCK R",
    "tck_ji_bing_jian": "极冰剑",
    "tck_ji_bing_jian_info": "你只可被火或光属性造成伤害，造成伤害时额外丢弃对手一张手牌，若无法丢弃手牌则此伤害+1。",
    "tck_ji_bing_jian_skill_1": "极冰剑",
    "tck_ji_bing_jian_skill_2": "极冰剑",
    "tck_ji_bing_jian_skill_2_info": "额外丢弃对手一张牌，若无法丢弃手牌则此伤害+1。",
  },
  list: [
  ],
}

export default r_cards