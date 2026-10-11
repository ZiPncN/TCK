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
    "tck_liu_xing_yu_dun": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_yu_dun.png",
      fullskin: true,
      type: "equip",
      subtype: "tck_equip2",
      skills: ["tck_liu_xing_yu_dun_skill"],
    },
    "tck_liu_xing_yu_ma": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_yu_ma.png",
      fullskin: true,
      type: "equip",
      subtype: "equip3",
      distance: {
        globalTo: 1,
      },
      skills: ["tck_liu_xing_yu_ma_skill"],
    },
  },
  skill: {
    "tck_liu_xing_yu_ma_skill": {
      equipSkill: true,
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha" && get.nature(card)?.includes("tck_lxy")) {
            return num + 1
          }
        },
      }
    },
    "tck_liu_xing_yu_dun_skill": {
      equipSkill: true,
      trigger: {
        target: "shaBegin",
      },
      forced: true,
      filter(event, player) {
        if (player.hasSkillTag("unequip2")) {
          return false;
        }
        if (
          event.player.hasSkillTag("unequip", false, {
            name: event.card ? event.card.name : null,
            target: player,
            card: event.card,
          })
        ) {
          return false;
        }
        return event.card.name == "sha" && get.nature(event.card)?.includes("tck_lxy")
      },
      content() {
        trigger.cancel()
      },
    },
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
    "tck_liu_xing_yu_ma": "流星雨马",
    "tck_liu_xing_yu_ma_skill": "流星雨马",
    "tck_liu_xing_yu_ma_info": "可以多出一张流星雨杀。",
    "tck_equip2": "防具",
    "tck_liu_xing_yu_dun": "流星雨盾",
    "tck_liu_xing_yu_dun_info": "流星雨杀无效，不占用防具位置。",
    "tck_liu_xing_yu_dun_skill": "流星雨盾",
    "TCK_LXY": "TCK 流星雨",
    "tck_liu_xing_yu_de_gong_yuan": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_info": "场地效果：黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill_info": "黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_cha_hua": "流星茶花",
    "tck_liu_xing_cha_hua_info": "回复1点体力，回复1点体力上限，判红色再回1点体力。",
  },
  list: [
    ['diamond', 10, 'tck_liu_xing_yu_ma'],
    ['diamond', 6, 'tck_liu_xing_yu_dun'],
    ['diamond', 10, 'sha', 'tck_lxy_niu'],
    ['diamond', 4, 'sha', 'tck_lxy_gou'],
    ['club', 9, 'sha', 'tck_lxy_9'],
    ['heart', 4, "tck_liu_xing_cha_hua"],
    ['diamond', 7, "tck_liu_xing_yu_de_gong_yuan"],
  ],
}

export default lxy_cards