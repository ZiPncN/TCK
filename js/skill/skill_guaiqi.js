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
    "tck_niu_qu": {
      trigger: {
        player: "phaseZhunbei"
      },
      forced: true,
      async content(event, trigger, player) {
        for (let t of game.players.filter(p => p != player)) {
          t.storage.tck_niu_qu = t.maxHp
          await t.loseMaxHp(Math.floor(t.maxHp / 2))
        }
      },
      group: ["tck_niu_qu_jieshu"],
      subSkill: {
        "jieshu": {
          trigger: {
            player: "phaseJieshu"
          },
          forced: true,
          async content(event, trigger, player) {
            for (let t of game.players.filter(p => p != player)) {
              const hpNum = t.storage.tck_niu_qu - t.maxHp
              await t.gainMaxHp(hpNum)
              delete t.storage.tck_niu_qu
            }
          },
        },
      },
    },
    "tck_ni_wang": {
      trigger: {
        player: "damageBegin",
        source: "damageBegin",
      },
      forced: true,
      filter(event, player) {
        return event.hasNature("tck_water") || event.hasNature("ice")
      },
      async content(event, trigger, player) {
        trigger.num++
      }
    },
  },
  translate: {
    "tck_niu_qu": "扭曲",
    "tck_niu_qu_info": "你的回合开始时，你令其他所有人体力上限减半（向上取整），于你回合结束回复之。",
    "tck_ni_wang": "溺亡",
    "tck_ni_wang_info": "你受到和造成的水属性与冰属性伤害+1。",
    "tck_mi_huo": "迷惑",
    "tck_mi_huo_info": "出牌阶段限一次，你可以弃1张手牌，使一人选择一项：<br/>①翻面。<br/>②弃置所有手牌。",
    "tck_xi_shou": "吸收",
    "tck_xi_shou_info": "回合结束，你选择一个翻面玩家，你令其流失一点体力并摸2张牌，然后你加1点体力上限和体力。",
  }
}
export default guaiqi_skills