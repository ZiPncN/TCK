import { lib, game, get, _status, ui } from "../../../../noname.js";
export const character_cards = {
  card: {
    "tck_qiu_chang_ji_qing_card": {
      image: "ext:TCK/imgs/charactors/tck_hxc.jpg",
      type: "trick",
      enable: true,
      selectTarget: 1,
      filterTarget(card, player, target) {
        return player != target && !target.isTurnedOver()
      },
      async content(event, trigger, player) {
        await player.loseMaxHp(1)
        await event.target.turnOver()
      }
    },
    "tck_fei_sha_card": {
      image: "ext:TCK/imgs/charactors/tck_fengfeisha.jpg",
      type: "trick",
      enable: true,
      selectTarget: 1,
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
    "tck_li_huo_card": {
      image: "ext:TCK/imgs/charactors/tck_buzhihuo.jpg",
      type: "trick",               // 锦囊牌
      enable: function (card, player) {
        return game.hasPlayer(target => player.canUse("sha", target, false, false))
      },
      notarget: true,
      usable: 1,
      async content(event, trigger, player) {
        const card = await game.createCard({ name: "sha", nature: "fire" })
        await player.chooseUseTarget(card, "nodistance", true, false)
      }
    },
    "tck_feng_kuang_zuan_shi_card": {
      image: "ext:TCK/imgs/charactors/tck_dongfangzhangzhu.jpg",
      type: "trick",
      enable(event, player) {
        return player.isDamaged()
      },
      selectTarget: -1,
      toSelf: true,
      usable: 1,
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        await player.recover(1)
        if (player.isHealthy()) {
          await player.loseHp(2)
        }
      },
    },
  },
  translate: {
    "TCK_CHARACTER": "TCK 将牌",
    "tck_qiu_chang_ji_qing_card": "球场鷄情",
    "tck_qiu_chang_ji_qing_card_info": "失去1点体力上限，使对手武将翻面1回合。",
    "tck_fei_sha_card": "飞沙",
    "tck_fei_sha_card_info": "可以选择对手3张牌。",
    "tck_li_huo_card": "离火",
    "tck_li_huo_card_info": "使用一张火杀，无距离限制。（不计杀）（需拟）（回合内）",
    "tck_feng_kuang_zuan_shi_card": "疯狂钻石",
    "tck_feng_kuang_zuan_shi_card_info": "可回复一颗勾玉，若到上限损失2颗勾玉。",

  },
  list: [
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_qiu_chang_ji_qing_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_fei_sha_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_li_huo_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_feng_kuang_zuan_shi_card'],
  ],
}

export default character_cards