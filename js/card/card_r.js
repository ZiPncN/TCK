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
    }
  },
  skill: {
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
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
    ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'], ['heart', 12, 'tck_card_su'],
  ],
}

export default r_cards