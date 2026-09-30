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
        await event.target.recover(1)
        if (event.target.isHealthy()) {
          await event.target.loseHp(2)
        }
      },
    },
    "tck_hj_tian_rou_card": {
      image: "ext:TCK/imgs/charactors/tck_hj_huanggai.jpg",
      type: "trick",
      enable(event, player) {
        return player.countCards("he") > 2 && player.isDamaged()
      },
      toSelf: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return player == target
      },
      async content(event, trigger, player) {
        await event.target.chooseToDiscard("he", 2, true)
        await event.target.recover(1)
      }
    },
    "tck_hj_jiang_chi_card": {
      image: "ext:TCK/imgs/charactors/tck_hj_caozhang.jpg",
      type: "trick",
      enable: true,
      toSelf: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return player == target
      },
      async content(event, trigger, player) {
        await game.delay(1)
        await event.target.chat(`${get.translation(player)}摸了摸牌`)
        await game.delay(2)
      }
    },
    "tck_lao_dong_zhi_xing_card": {
      image: "ext:TCK/imgs/charactors/tck_wzh.jpg",
      type: "trick",
      enable: true,
      toSelf: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return player == target
      },
      async content(event, trigger, player) {
        await event.target.loseHp(1)
        let cards = []
        while (true) {
          let res = await event.target.judge((card) => {
            if (get.type(card) == "trick" || get.type(card) == "delay") return 0
            return 1
          }).forResult()
          if (get.type(res.card) == "trick" || get.type(res.card) == "delay") {
            cards.push(res.card)
            break
          }
          cards.push(res.card)
        }
        await event.target.gain(cards, "gain2")
      },
    },
    "tck_yi_yu_card": {
      image: "ext:TCK/imgs/charactors/tck_rkshs_fuchuangzi.jpg",
      type: "trick",
      enable(event, player) {
        return player.countCards("h") > 0;
      },
      selectTarget: 1,
      filterTarget(card, player, target) {
        return player != target && player.canCompare(target)
      },
      usable: 1,
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
    "tck_mi_huo_card": {
      image: "ext:TCK/imgs/charactors/tck_bachidaren.jpg",
      type: "trick",
      enable(event, player) {
        return player.countCards("h") > 1
      },
      usable: 1,
      selectTarget: 1,
      filterTarget(card, player, target) {
        return target != player
      },
      async content(event, trigger, player) {
        await player.chooseToDiscard("h", 1, true)
        let result = await event.target.chooseControl(['翻面', '弃置所有手牌'])
          .forResult()
        switch (result.control) {
          case '翻面':
            await event.target.turnOver()
            break
          case '弃置所有手牌':
            await event.target.discard(event.target.getCards('h'), true)
            break
        }
      }
    },
  },
  translate: {
    "tck_mi_huo_card": "迷惑",
    "tck_mi_huo_card_info": "出牌阶段限一次，你可以弃1张手牌，使一人选择一项：<br/>①翻面。<br/>②弃置所有手牌。",
    "tck_yi_yu_card": "抑郁",
    "tck_yi_yu_card_info": "出牌阶段限一次，你可与一人拼点，若你赢，其选择一项：<br/>①失去1点体力上限。<br/>②流失1点体力。<br/>若你输，你获得一个抑标记。",
    "tck_lao_dong_zhi_xing_card": "劳动之星",
    "tck_lao_dong_zhi_xing_card_info": "支付1颗勾玉，从牌堆获得至锦囊牌的所有牌。",
    "tck_hj_jiang_chi_card": "将驰",
    "tck_hj_jiang_chi_card_info": "出牌阶段，你可以摸一摸牌。",
    "tck_hj_tian_rou_card": "甜肉",
    "tck_hj_tian_rou_card_info": "出牌阶段，你可以弃置2张牌（至少为2），然后回复1点体力。",
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
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_mi_huo_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_yi_yu_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_lao_dong_zhi_xing_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_hj_jiang_chi_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_qiu_chang_ji_qing_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_fei_sha_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_li_huo_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_feng_kuang_zuan_shi_card'],
    [lib.suit.randomGet(), get.rand(1, 13), 'tck_hj_tian_rou_card'],
  ],
}

export default character_cards