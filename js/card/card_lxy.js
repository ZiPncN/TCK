import { lib, game, get, _status, ui } from "../../../../noname.js";
export const lxy_cards = {
  card: {
    "tck_liu_xing_cha_hua": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_cha_hua.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: -1,
      toSelf: true,    //是否自己使用
      //只能对自己用
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        await event.target.recover(1)
        await event.target.gainMaxHp(1)
        let res = await event.target.judge((card) => {
          if (card.color == "red") return 1
          return -1
        }).forResult()
        if (res.color == 'red') await event.target.recover(1)
      }
    },
    "tck_liu_xing_yu_de_gong_yuan": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_yu_de_gong_yuan.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_liu_xing_yu_de_gong_yuan")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
  },
  skill: {
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill": {
      ruleSkill: true,
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      async content(event, trigger, player) {
        let res = await player.judge((card) => {
          if (2 <= get.number(card) && get.number(card) <= 9) {
            if (get.suit(card) == 'diamond') return -1
            if (get.suit(card) == 'heart') return -2
            if (get.suit(card) == 'spade' || get.suit(card) == 'club') return 1
          }
          return 0
        }).forResult()
        if (2 <= get.number(res) && get.number(res) <= 9) {
          switch (get.suit(res)) {
            case 'diamond':
              let card = await player.chooseCard("he", true, 2).set('prompt', '请弃置2张牌').forResult()
              await player.discard(card.cards)
              break;
            case 'heart':
              await player.turnOver()
              break;
            case 'spade':
              await player.draw(2)
              break;
            case 'club':
              await player.recover(1)
              break;
          }
        }
      }
    },
  },
  translate: {
    "TCK_LXY": "TCK 流星雨",
    "tck_liu_xing_yu_de_gong_yuan": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_info": "场地效果：黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill_info": "黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_cha_hua": "流星茶花",
    "tck_liu_xing_cha_hua_info": "回复1点体力，回复1点体力上限，判红色再回1点体力。",
  },
  list: [
    ['diamond', 4, 'sha', 'tck_lxy_gou'],
    ['heart', 4, "tck_liu_xing_cha_hua"],
    ['diamond', 7, "tck_liu_xing_yu_de_gong_yuan"],
  ],
}

export default lxy_cards