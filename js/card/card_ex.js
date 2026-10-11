import { lib, game, get, _status, ui } from "../../../../noname.js";
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
       onEquip() {          // 获得装备时
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
    "tck_plus_four_hp": {
      image: "ext:TCK/imgs/cards/tck_plus_four_hp.png",
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
        await event.target.gainMaxHp(4)
        await event.target.recover(4)
        await game.cardsGotoSpecial(event.cards);
      }
    },
    "tck_card_dao": {
      type: "basic",
      fullskin: true,
      image: "ext:TCK/imgs/cards/tck_card_dao.png",
      global: "tck_card_dao_skill",
    },
    // 单挑模式下死一个随从就立即结束的问题，直接修改mode中的single.js
    "tck_sa_dou_cheng_bing": {
      image: "ext:TCK/imgs/cards/tck_sa_dou_cheng_bing.png",
      fullskin: true,
      type: "trick",
      enable: true,
      selectTarget: -1,
      toSelf: true,
      global: "tck_sa_dou_cheng_bing_effect",
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        const target = event.target
        const res = await target.judge(card => {
          if (get.color(card) == 'red') return 1
          if (get.color(card) == 'black') return -2
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          const list = Object.keys(lib.character)
          if (!list || list.length == 0) {
            return
          }
          const player2 = await game.addPlayerOL(target, list.randomGet(), undefined, true)
          player2.storage.tck_sa_dou_cheng_bing = true
          player2.identity = target.identity
          // if (player2.identity == 'zhu') player2.identity = 'zhong'
          await player2.setIdentity()
          player2.identityShown = true
          if (player2.maxHp > 1) {
            await player2.loseMaxHp(player2.maxHp - 1)
          }
        } else if (get.color(res) == 'black') {
          let options = []
          if (target.countCards("h") > 0) options.push(["h", "手牌区"])
          if (target.countCards("e") > 0) options.push(["e", "装备区"])
          if (target.countCards("j") > 0) options.push(["j", "判定区"])
          if (options.length == 0) return
          if (options.length == 1) {
            switch (options[0][0]) {
              case 'h':
                await target.discard(target.getCards("h"))
                break;
              case 'e':
                await target.discard(target.getCards("e"))
                break;
              case 'j':
                await target.discard(target.getCards("j"))
                break;
            }
            return
          }
          let result = await target
            .chooseButton([
              '请选择弃置所有牌的区域',
              [options, "textbutton"]
            ], true)
            .forResult()
          if (result.bool) {
            switch (result.links[0]) {
              case 'h':
                await target.discard(target.getCards("h"))
                break;
              case 'e':
                await target.discard(target.getCards("e"))
                break;
              case 'j':
                await target.discard(target.getCards("j"))
                break;
            }
          }
        }
      },
    },
    "tck_tou_tian_huan_ri": {
      image: "ext:TCK/imgs/cards/tck_tou_tian_huan_ri.png",
      fullskin: true,
      type: "trick",
      enable: true,
      selectTarget: -1,
      toSelf: true,
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        await event.target.draw(2)
        const pileCards = get.cards(2, false)
        const res = await event.target.chooseToMove()
          .set("list", [["牌堆顶", pileCards]])
          .forResult()
        if (res.bool) {
          const cards = res.moved[0].slice(0)
          if (cards?.length) {
            cards.reverse()
            await game.cardsGotoPile(cards, "insert")
          }
        }
      }
    },
  },
  skill: {
    "tck_sa_dou_cheng_bing_effect": {
      cardSkill: true,
      unique: true,
      forced: true,
      popup: false,
      firstDo: true,
      trigger: {
        global: "die"
      },
      filter(event, player) {
        return event.player.storage.tck_sa_dou_cheng_bing
      },
      async content(event, trigger, player) {
        delete trigger.player.storage.tck_sa_dou_cheng_bing
        await game.removePlayerOL(trigger.player)
      },
    },
    "tck_card_dao_skill": {
      cardSkill: true,
      unique: true,
      direct: true,
      enable: ["chooseToUse"],
      filter(event, player) {
        return player.countCards("hs", card => get.name(card) == "tck_card_dao")
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
          return ui.create.dialog("道", [list, "vcard"]);
        },
        filter(button, player) {
          return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
        },
        backup(links, player) {
          let name = links[0][2]
          let rawname = "tck_card_dao"
          return {
            filterCard: { name: rawname },
            popname: true,
            viewAs: { name: name, nature: links[0][3] },
          }
        },
        prompt(links, player) {
          let name = links[0][2]
          let rawname = "tck_card_dao"
          return "将一张" + get.translation(rawname) + "当做" + get.translation(name) + "使用"
        },
      },
    },
    "tck_bian_ya_qi_bw_skill": {
      equipSkill: true,
      trigger: {
        source: "damageBegin2"
      },
      forced: true,
      async content(event, trigger, player) {
        trigger.num *= 2
      }
    },
    "tck_bian_ya_qi_wq_skill": {
      equipSkill: true,
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
    "tck_tou_tian_huan_ri": "偷天换日",
    "tck_tou_tian_huan_ri_info": "你从牌堆顶摸2张牌并查看牌顶2张牌，然后调整顺序。",
    "tck_sa_dou_cheng_bing": "撒豆成兵",
    "tck_sa_dou_cheng_bing_info": "判定，若为红色，召唤一个一血的武将，若为黑色，弃置一个有牌区域的所有牌。",
    "tck_card_dao": "道",
    "tck_card_dao_info": "可当作任意基本牌使用。",
    "tck_card_dao_skill": "道",
    "tck_plus_four_hp": "\t",
    "tck_plus_four_hp_info": "+4上限，+4体力。",
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
    ['heart', 7, "tck_tou_tian_huan_ri"],
    ['heart', 13, "tck_sa_dou_cheng_bing"],
    ['', Number.MAX_VALUE, "tck_card_dao"],
    ['heart', 9, "tck_plus_four_hp"],
    ['club', 8, 'tck_tou_zi'],
    ['spade', 9, 'tck_bian_ya_qi_bw'],
    ['club', 13, 'tck_bian_ya_qi_wq'],
    ['heart', 13, 'tck_chong_sheng_zhi_lu'],
  ],
}

export default ex_cards