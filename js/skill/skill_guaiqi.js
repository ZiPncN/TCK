import { lib, game, get, _status, ui } from "../../../../noname.js";
export const guaiqi_skills = {
  skill: {
    "tck_mi_huo": {
      enable: "phaseUse",
      usable: 1,
      selectCard: 1,
      position: "h",
      filterCard: true,
      filterTarget(card, player, target) {
        return target != player
      },
      filter(event, player) {
        return player.countCards("h") > 0
      },
      async content(event, trigger, player) {
        let result = await event.target.chooseControl(['翻面', '弃置所有手牌'])
          .forResult();
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
    "tck_xi_shou": {
      trigger: {
        player: "phaseJieshu"
      },
      filter(event, trigger, player) {
        return game.players.some(player => player.isTurnedOver())
      },
      async content(event, trigger, player) {
        let res = await player.chooseTarget((caed, player, target) => target.isTurnedOver(), 1, true).forResult()
        let target = res.targets[0]
        await target.loseHp(1)
        await target.draw(2)
        await player.gainMaxHp(1)
        await player.recover(1)
      }
    },
  },
  translate: {
    "tck_mi_huo": "迷惑",
    "tck_mi_huo_info": "出牌阶段限一次，你可以弃1张手牌，使一人选择一项：<br/>①翻面。<br/>②弃置所有手牌。",
    "tck_xi_shou": "吸收",
    "tck_xi_shou_info": "回合结束，你选择一个翻面玩家，你令其流失一点体力并摸2张牌，然后你加1点体力上限和体力。",
  }
}
export default guaiqi_skills