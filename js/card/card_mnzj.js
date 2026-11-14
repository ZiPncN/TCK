import { lib, game, get, _status, ui } from "../../../../noname.js";
export const mnzj_cards = {
  card: {
    "tck_mnzj_mo_nv_zhi_jia": {
      image: "ext:TCK/imgs/cards/tck_mnzj_mo_nv_zhi_jia.png",
      fullskin: true,
      type: "land",
      enable: true,
      notarget: true,
      async content(event, trigger, player) {
        player.changeTckLand("tck_mnzj_mo_nv_zhi_jia")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_card_mnzj_jue_wang": {
      type: "trick",
      image: "ext:TCK/imgs/cards/tck_card_mnzj_jue_wang.png",
      fullskin: true,
      global: ["tck_card_mnzj_jue_wang_skill"],
      wuxieable: true,
      content() { },
    },
  },
  skill: {
    "tck_card_mnzj_jue_wang_skill": {
      forced: true,
      cardSkill: true,
      trigger: {
        player: ["gainEnd"],
        global: ["phaseBefore"],
      },
      filter(event, player) {
        const evt = event.getParent(2)
        if (evt.name && evt.name == "tck_card_mnzj_jue_wang_skill") return false
        return player.hasCards("h", card => get.name(card) == "tck_card_mnzj_jue_wang")
      },
      async content(event, trigger, player) {
        while (true) {
          if (!player.hasCards("h", card => get.name(card) == "tck_card_mnzj_jue_wang")) {
            return
          }
          const juewangs = await player.getCards("h", card => get.name(card) == "tck_card_mnzj_jue_wang")
          const juewang = juewangs[0]
          let options = [["②", "摸1张牌，然后弃置本牌"]]
          if (player.hasCards("h", card => card != juewang)) {
            options.unshift(["①", "弃1张手牌，将本牌洗回牌堆"])
          }
          const res = await player.chooseButton(["【绝望】：请选择一项",
            [options, "textbutton"]], true).forResult()
          if (res.bool) {
            switch (res.links[0]) {
              case '①':
                await player.chooseToDiscard(1, "h", true, card => card != juewang)
                await game.cardsGotoPile(juewang, () => ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)])
                break
              case '②':
                await player.draw(1)
                await player.discard(juewang)
                break
            }
          }
        }
      }
    },
    "tck_mnzj_mo_nv_zhi_jia_tckland_skill": {
      ruleSkill: true,
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      filter(event, player) {
        if (player.hasIgnoreLandSkill()) return false
        if (_status.tck_mnzj_mo_nv_zhi_jia_expired) return false
        return true
      },
      async content(event, trigger, player) {
        if (player.name == "tck_mnzj_ailian") {
          const options = [
            ["②", `摸${game.players.length}张牌，本场景失效一轮`]
          ]
          if (player.hasCards("he")) options.unshift(["①", "弃1张牌，跳过判定"])
          const res = await player.chooseButton(["请选择一项",
            [options, "textbutton"]], true).forResult()
          if (res.bool) {
            switch (res.links[0]) {
              case '①':
                await player.chooseToDiscard("he", 1, true)
                break
              case '②':
                await player.draw(game.players.length)
                _status.tck_mnzj_mo_nv_zhi_jia_expired = true
                break
            }
            return
          }
        }
        const res = await player.judge((card) => {
          if (get.suit(card) == 'heart') return -2
          else if (get.suit(card) == 'spade') return -3
          else if (get.suit(card) == 'diamond') return -1.5
          else if (get.suit(card) == 'club') return -2
          return 1
        }).forResult()
        if (get.suit(res) == 'heart') await player.loseHp(2)
        else if (get.suit(res) == 'spade') await player.damage(3, "nosource")
        else if (get.suit(res) == 'diamond') await player.loseMaxHp(1)
        else if (get.suit(res) == 'club') await player.chooseToDiscard("he", 4, true)
      }
    },
    "tck_mnzj_mo_nv_zhi_jia_tckland_skill_1": {
      ruleSkill: true,
      trigger: {
        global: "roundStart"
      },
      charlotte: true,
      forced: true,
      popup: false,
      filter(event, player) {
        return _status.tck_mnzj_mo_nv_zhi_jia_expired
      },
      async content(event, trigger, player) {
        _status.tck_mnzj_mo_nv_zhi_jia_expired = false
      },
    },
  },
  translate: {
    "tck_card_mnzj_jue_wang": "绝望",
    "tck_card_mnzj_jue_wang_info": "若你摸到后：<br/>①你为艾莲，直接死亡。<br/>②你不为艾莲，选择1项：<br/>①弃1张手牌，然后将本牌洗回牌堆。②摸1张牌，然后弃置本牌。",
    "tck_mnzj_mo_nv_zhi_jia": "魔女之家",
    "tck_mnzj_mo_nv_zhi_jia_info": "场地效果：回合开始判定：若为♥，流失2点体力，若为♠，受到3点伤害，若为♦，失去1点体力上限，若为♣，弃4张牌。<br/>若你为艾莲，①你可弃1张牌跳过判定。②你可摸X张牌，本场景失效一轮。（X为场上存活人数）",
    "tck_mnzj_mo_nv_zhi_jia_tckland_skill": "魔女之家",
    "tck_mnzj_mo_nv_zhi_jia_tckland_skill_info": "回合开始判定：若为♥，流失2点体力，若为♠，受到3点伤害，若为♦，失去1点体力上限，若为♣，弃4张牌。<br/>若你为艾莲，①你可弃1张牌跳过判定。②你可摸X张牌，本场景失效一轮。（X为场上存活人数）",
    "TCK_MNZJ": "TCK 魔女之家",
  },
  list: [],
}

export default mnzj_cards