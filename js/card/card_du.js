import { lib, game, get, _status, ui } from "../../../../noname.js";
export const du_cards = {
  card: {
    "tck_card_du_tao": {
      image: "ext:TCK/imgs/cards/tck_card_du_tao.png",
      fullskin: true,
      type: "basic",
      filterTarget: true,
      global: 'g_tck_card_du_tao',
      async content(event, trigger, player) {
        await event.target.loseHp(1)
      },
    },
    "tck_card_du_ju": {
      image: "ext:TCK/imgs/cards/tck_card_du_ju.png",
      fullskin: true,
      type: "basic",
      filterTarget: true,
      global: 'g_tck_card_du_ju',
      async content(event, trigger, player) {
        await event.target.loseHp(1)
        const res = await event.target.judge(card => {
          if (get.suit(card) == "heart") return -1
          return 1
        }).forResult()
        if (get.suit(res) == "heart") {
          await event.target.damage(1, event.target, 'fire')
        }
      },
      ai: {
        tag: {
          damage: 1,
          natureDamage: 1,
          fireDamage: 1,
        }
      }
    },
  },
  skill: {
    "g_tck_card_du_ju": {
      trigger: { global: 'dying' },
      direct: true,
      filter: function (event, player) {
        if (event.player == player) return false;
        if (!lib.filter.targetEnabled({ name: 'tck_card_du_ju' }, player, event.player)) return false;
        return player.hasUsableCard('tck_card_du_ju');
      },
      async content(event, trigger, player) {
        while (player.hasUsableCard('tck_card_du_ju')) {
          const res = await player.chooseToUse(
            get.prompt('tck_card_du_ju', trigger.player).replace(/发动/, '使用'),
            function (card, player) {
              if (card.name != 'tck_card_du_ju') return false;
              return lib.filter.cardEnabled(card, player, 'forceEnable')
            }, trigger.player, -1).set('targetRequired', true).forResult()
          if (!res.bool) return
        }
      }
    },
    "g_tck_card_du_tao": {
      trigger: { global: 'dying' },
      direct: true,
      filter: function (event, player) {
        if (event.player == player) return false;
        if (!lib.filter.targetEnabled({ name: 'tck_card_du_tao' }, player, event.player)) return false;
        return player.hasUsableCard('tck_card_du_tao');
      },
      async content(event, trigger, player) {
        while (player.hasUsableCard('tck_card_du_tao')) {
          const res = await player.chooseToUse(
            get.prompt('tck_card_du_tao', trigger.player).replace(/发动/, '使用'),
            function (card, player) {
              if (card.name != 'tck_card_du_tao') return false;
              return lib.filter.cardEnabled(card, player, 'forceEnable')
            }, trigger.player, -1).set('targetRequired', true).forResult()
          if (!res.bool) return
        }
      }
    },
  },
  translate: {
    "tck_card_du_ju": "毒橘",
    "tck_card_du_ju_info": "同毒桃，然后判定，若为♥，其受1点火属性伤害（上火）。",
    "tck_card_du_tao": "毒桃",
    "tck_card_du_tao_info": "有人濒死时对其用，其流失1体力。",
    // "tck_card_du_tao_info": "有玩家濒死时，对其使用，其受到一点伤害。",
    "TCK_DU": "TCK 毒",
  },
  list: [
    ['spade', 5, 'tck_card_du_ju'],
    ['spade', 3, 'tck_card_du_tao'],
    ['spade', 10, 'tck_card_du_tao'],
    ['spade', 3, 'tck_card_du_tao'],
    ['club', 10, 'du', null, ["gifts"]],
    ['club', 3, 'du'],
    ['diamond', 3, 'du', null, ["gifts"]],
    ['spade', 7, 'du', null, ["gifts"]],
    ['spade', 3, 'du', null, ["gifts"]],
    ['club', 1, 'guaguliaodu'],
    ['heart', 2, 'guaguliaodu'],
  ],
}

export default du_cards