import { lib, game, get, _status, ui } from "../../../../noname.js";
export const mnzj_skills = {
  skill: {
    "tck_mnzj_dan_chun": {
      charlotte: true,
      forced: true,
      trigger: {
        target: "useCardToTarget"
      },
      filter(event, player) {
        return get.type2(event.card) == 'trick'
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.color(card) == 'red') return 1
          else if (get.color(card) == 'black') return -2
          return -1
        }).forResult()
        if (get.color(res) == 'red') {
          const source = trigger.player
          const res = await source.chooseToDiscard(`请弃置一张手牌，否则${get.translation(trigger.card)}失效`, 1, "h").forResult()
          if (!res.bool) {
            // 该牌失效
            const evt = trigger.getParent(1)
            evt.targets.length = 0
            evt.all_excluded = true
            await trigger.cancel()
          }
        } else if (get.color(res) == 'black') {
          await trigger.directHit.add(player)
        }
      }
    },
    "tck_mnzj_xin_shan": {
      enable: "phaseUse",
      usable: 1,
      filterTarget: true,
      selectTarget: 1,
      async content(event, trigger, player) {
        const target = event.target
        if (target.isDamaged()) {
          await target.recover(1)
          await target.draw(1)
        } else {
          await target.draw(3)
        }
      }
    },
    "tck_mnzj_wei_shan": {
      enable: "phaseUse",
      usable: 1,
      filter(event, player) {
        return game.hasPlayer(p => p.isDamaged())
      },
      filterTarget(card, player, target) {
        return target.isDamaged()
      },
      async content(event, trigger, player) {
        const target = event.target
        await target.recover(1)
        const result = await target
          .chooseButton([
            '请选择一项',
            [[
              ["①", `流失2点体力`],
              ["②", `弃2张牌`]
            ], "textbutton"]
          ], true)
          .forResult()
        if (result.bool) {
          switch (result.links[0]) {
            case '①':
              await target.loseHp(2)
              break;
            case '②':
              await target.chooseToDiscard("he", 2, true)
              break;
          }
        }
      },
    },
    "tck_mnzj_de_cheng": {
      trigger: { player: "useCard" },
      forced: true,
      filter(event) {
        return get.type2(event.card) === "trick"
      },
      async content(event, trigger, player) {
        if (get.color(trigger.card) == "red") {
          await player.draw(1)
        } else if (get.color(trigger.card) == "black") {
          await trigger.directHit.addArray(game.players)
        }
      },
    },

  },
  translate: {
    "tck_mnzj_wei_shan": "伪善",
    "tck_mnzj_wei_shan_info": "出牌阶段限一次，你可指定一人，令其回复一点体力，然后其选择一项：①流失2点体力，②弃2张牌。",
    "tck_mnzj_de_cheng": "得逞",
    "tck_mnzj_de_cheng_info": "你使用锦囊牌时，若此牌为黑色，则不能响应；若为红色，你摸1张牌。",
    "tck_mnzj_dan_chun": "单纯",
    "tck_mnzj_dan_chun_info": "锁定技，其他人对用锦囊时，应进行判定，若为黑色，你不能响应该锦囊，若为红色，来源需弃1张手牌，否则该锦囊失效。",
    "tck_mnzj_xin_shan": "心善",
    "tck_mnzj_xin_shan_info": "出牌阶段限1次，你可指定一人回复1点体力并摸1张牌，若其为满体力，则改为摸3张牌。",
  }
}
export default mnzj_skills