import { lib, game, get, _status, ui } from "../../../noname.js";
export const ex_cards = {
  card: {
    "tck_tou_zi": {
      image: "ext:TCK/imgs/cards/tck_tou_zi.png",
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
        //掷一次骰子
        await event.target.throwDice();
        await event.target.draw(_status.event.num)
      },
    },
    "tck_bian_ya_qi_bw": {
      image: "ext:TCK/imgs/cards/tck_bian_ya_qi.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip5",           // 宝物
      skills: ["tck_bian_ya_qi_bw_skill"],  // 装备技能
      /* distance: {               // 距离修正
        attackFrom: -1,       // 攻击距离
        globalFrom: -1,       // 防御距离
      }, */
      /*  onLose() {          // 失去装备时
       },
       onGain() {          // 获得装备时
       }, */
    },
    "tck_bian_ya_qi_wq": {
      image: "ext:TCK/imgs/cards/tck_bian_ya_qi.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip1",           // 武器
      skills: ["tck_bian_ya_qi_wq_skill"],  // 装备技能
      distance: {               // 距离修正
        attackFrom: -5,       // 攻击距离
      },
    },
    "tck_chong_sheng_zhi_lu": {
      image: "ext:TCK/imgs/cards/tck_chong_sheng_zhi_lu.png",
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
        //定义初始花色数组
        let suits = []
        while (true) {
          //判定
          let res = await event.target.judge(card => {
            if (suits.includes(card.suit)) {
              return -1
            }
            return 1
          }).forResult()
          if (event.target.isDamaged()) {
            //体力不满，回复1点体力
            await event.target.recover(1)
          }
          else {
            //体力满，选择摸1张牌或者+1体力上限
            let result = await event.target.chooseControl(['+1体力上限', '摸1张牌'])
              .forResult();
            switch (result.control) {
              case '+1体力上限':
                await event.target.gainMaxHp(1)
                break;
              case '摸1张牌':
                await event.target.draw();
                break;
            }
          }
          if (suits.includes(res.suit)) {
            break
          }
          suits.push(res.suit)
        }
        //移出游戏
        await game.cardsGotoSpecial(event.cards);
      },
    },
  },
  skill: {
    "tck_bian_ya_qi_bw_skill": {
      trigger: {
        source: "damageBegin2"
      },
      forced: true,
      async content(event, trigger, player) {
        trigger.num *= 2
      }
    },
    "tck_bian_ya_qi_wq_skill": {
      trigger: {
        source: "damageBegin1"
      },
      forced: true,
      //是牌造成的伤害才发动
      filter(event, player) {
        return event.card
      },
      async content(event, trigger, player) {
        if (trigger.card.color == "red") {
          trigger.num *= 2
        } else if (trigger.card.color == "black") {
          trigger.num -= 1
        }
      }
    },
  },
  translate: {
    "tck_chong_sheng_zhi_lu": "重生之路",
    "tck_chong_sheng_zhi_lu_info": "你判定，你每判定一张，你就+1体力，若满血，改为+1体力上限或摸1张牌，判定直至出现相同花色为止，然后本局本牌移出游戏。",
    "tck_bian_ya_qi_wq": "变压器",
    "tck_bian_ya_qi_wq_info": "你红牌的伤害翻倍，你黑牌的伤害-1。",
    "tck_bian_ya_qi_wq_skill": "变压器",
    "tck_bian_ya_qi_wq_skill_info": "你红牌的伤害翻倍，你黑牌的伤害-1。",
    "TCK_EX": "TCK EX",
    "tck_tou_zi": "骰子",
    "tck_tou_zi_info": "对自己使用，你可以投掷一次骰子，然后你摸等同于点数的牌数。",
    "tck_bian_ya_qi_bw": "变压器",
    "tck_bian_ya_qi_bw_info": "你造成的伤害翻倍。",
    "tck_bian_ya_qi_bw_skill": "变压器",
    "tck_bian_ya_qi_bw_skill_info": "你造成的伤害翻倍。",
  },
  list: [
    //diy牌堆
    ['club', 8, 'tck_tou_zi'],
    ['spade', 9, 'tck_bian_ya_qi_bw'],
    ['club', 13, 'tck_bian_ya_qi_wq'],
    ['heart', 13, 'tck_chong_sheng_zhi_lu'],
  ],
}

export default ex_cards