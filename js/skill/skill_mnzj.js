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
        return event.source != player && get.type2(event.card) == 'trick'
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
    "tck_mnzj_yin_dao": {
      enable: "phaseUse",
      usable: 1,
      filterCard: true,
      position: "he",
      filter(event, player) {
        return player.hasCards("he")
      },
      async content(event, trigger, player) {
        const card = game.createCard('tck_mnzj_mo_nv_zhi_jia')
        await player.useCard(card)
      }
    },
    "tck_mnzj_jue_wang": {
      trigger: {
        player: "phaseZhunbei"
      },
      forced: true,
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.recoverTo(player.maxHp)
      },
      group: ["tck_mnzj_jue_wang_gameStart", "tck_mnzj_jue_wang_draw"],
      subSkill: {
        "gameStart": {
          trigger: {
            global: "gameStart"
            // global: "phaseBefore",
            // player: "enterGame"
          },
          forced: true,
          filter(event, player) {
            return !lib.inpile.includes("tck_card_mnzj_jue_wang")
            // return (event.name !== "phase" || game.phaseNumber === 0) && !lib.inpile.includes("tck_card_mnzj_jue_wang");
          },
          async content(event, trigger, player) {
            const card1 = game.createCard2("tck_card_mnzj_jue_wang", "spade", 3)
            const card2 = game.createCard2("tck_card_mnzj_jue_wang", "spade", 2)
            const card3 = game.createCard2("tck_card_mnzj_jue_wang", "club", 2)
            const cards = [card1, card2, card3]
            game.broadcastAll(() => void lib.inpile.add("tck_card_mnzj_jue_wang"))
            game.cardsGotoPile(cards, () => ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)])
          },
        },
        "draw": {
          charlotte: true,
          forced: true,
          trigger: {
            player: ["gainEnd"],
            global: ["phaseBefore"],
          },
          firstDo: true,
          filter(event, player) {
            return player.hasCards("h", card => get.name(card) == "tck_card_mnzj_jue_wang")
          },
          async content(event, trigger, player) {
            await player.die()
          }
        },
      }
    },
    "tck_mnzj_jue_fen": {
      enable: "phaseUse",
      usable: 1,
      filterCard: true,
      position: "he",
      filter(event, player) {
        return player.hasCards("he")
      },
      async content(event, trigger, player) {
        const card = game.createCard('tck_mnzj_mo_nv_zhi_jia_jue')
        await player.useCard(card)
      }
    },
    "tck_mnzj_after_jue_wang": {
      trigger: {
        player: ["dying", "phaseZhunbei"]
      },
      prompt2: "你濒死时或回合开始时，你可以失去1点体力上限，将体力回复至满。",
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.loseMaxHp(1)
        await player.recoverTo(player.maxHp)
      },
      group: ["tck_mnzj_after_jue_wang_gameStart"],
      subSkill: {
        "gameStart": {
          trigger: {
            global: "gameDrawAfter",
            player: "enterGame"
          },
          forced: true,
          filter(event, player) {
            return lib.inpile.includes("tck_card_mnzj_jue_wang") && !lib.inpile.includes("tck_card_mnzj_jian_zheng");
          },
          async content(event, trigger, player) {
            const cards = ["cardPile", "discardPile"].map((pos) => Array.from(ui[pos].childNodes)).flat()
            const cardx = cards.filter(card => get.name(card) == "tck_card_mnzj_jue_wang")
            // const handCardx = target.getCards("hej", card => get.name(card) == "tck_card_mnzj_jue_wang");
            for (let card of cardx) {
              let suit = get.suit(card)
              if (suit == "spade") {
                suit = "heart"
              } else if (suit == "club") {
                suit = "diamond"
              }
              const card1 = await game.createCard2("tck_card_mnzj_jian_zheng", suit, get.number(card))
              const pos = get.position(card)
              const inPile = pos === "c"
              const anchor = inPile ? card.nextSibling : null

              await game.cardsGotoSpecial(card)

              if (inPile) {
                await game.cardsGotoPile(card1, () => {
                  if (anchor && anchor.parentNode !== ui.cardPile) return null
                  return anchor
                })
              } else if (pos === "d") {
                await game.cardsGotoPile(card1)
              } else {
                await game.cardsGotoPile(card1)
              }
            }
            game.broadcastAll(() => void lib.inpile.add("tck_card_mnzj_jian_zheng"))
          },
          mod: {
            cardDiscardable(card, player) {
              if (get.name(card) == "tck_card_mnzj_jian_zheng") {
                return false;
              }
            }
          },
        },
      }
    },
    "tck_mnzj_tun_shi": {
      trigger: { global: "dying" },
      forced: true,
      async content(event, trigger, player) {
        const res = await trigger.player.judge(card => {
          if (get.suit(card) == 'club') return -1
          return 1
        }).forResult()
        if (get.suit(res) == 'club') {
          trigger.cancel()
          await trigger.player.die(trigger)
        }
      },
      group: ["tck_mnzj_tun_shi_die"],
      subSkill: {
        "die": {
          trigger: { global: "die" },
          forced: true,
          async content(event, trigger, player) {
            await player.gainMaxHp(1)
            await player.recover(1)
          },
        },
      },
    },
    "tck_mnzj_mo_fa": {
      mark: true,
      markimage: "extension/TCK/imgs/cards/tck_mnzj_mo_fa_bi_ji.png",
      intro: {
        name: "魔法笔记",
        content(storage, player) {
          const { note } = lib.skill.tck_mnzj_mo_fa.getMagicNote(player)
          return note.map(n => n.slice(1).join("<br/>")).join("<br/><br/>")
        },
      },
      enable: "phaseUse",
      usable: 1,
      async content(event, trigger, player) {
        const magicNote = lib.skill.tck_mnzj_mo_fa.getMagicNote(player)
        const magicContent = lib.skill.tck_mnzj_mo_fa.magicContent
        const result = await player
          .chooseButton([
            '【魔法笔记】：请选择一个可使用的魔法',
            [magicNote.note, "textbutton"]
          ], true)
          .set("filterButton", magicNote.filter)
          .forResult()
        if (result.bool) {
          if (!result.links[0]) return
          const prompt2 = get.translation(`${result.links[0]}_info`)
          switch (result.links[0]) {
            case 'tck_mnzj_mo_fa_1':
              await magicContent.tck_mnzj_mo_fa_1(event, trigger, player, prompt2)
              break;
            case 'tck_mnzj_mo_fa_2':
              await magicContent.tck_mnzj_mo_fa_2(event, trigger, player, prompt2)
              break
            case 'tck_mnzj_mo_fa_3':
              await magicContent.tck_mnzj_mo_fa_3(event, trigger, player, prompt2)
              break
            case 'tck_mnzj_mo_fa_4':
              await magicContent.tck_mnzj_mo_fa_4(event, trigger, player, prompt2)
              break
            case 'tck_mnzj_mo_fa_5':
              await magicContent.tck_mnzj_mo_fa_5(event, trigger, player, prompt2)
              break
          }
        }
      },
      getMagicNote(player) {
        const note = lib.skill.tck_mnzj_mo_fa.magicNote.map(skill => {
          return [skill, `${get.translation(skill)}<br/>·效果：${get.translation(skill + "_info")}<br/>·条件：${get.translation(skill + "_condition")}`]
        })
        const filter = (button) => {
          if (button.link == "tck_mnzj_mo_fa_1") {
            return player.countCards("h", card => get.color(card) == "black") >= 2
          } else if (button.link == "tck_mnzj_mo_fa_2") {
            return player.countCards("h", card => get.color(card) == "red") >= 1
          } else if (button.link == "tck_mnzj_mo_fa_3") {
            return player.getSuitNum("h") >= 3
          } else if (button.link == "tck_mnzj_mo_fa_4") {
            return player.getSuitNum("he") >= 4
          } else if (button.link == "tck_mnzj_mo_fa_5") {
            return true
          }
          return false
        }
        return { note, filter }
      },
      magicNote: ["tck_mnzj_mo_fa_1", "tck_mnzj_mo_fa_2", "tck_mnzj_mo_fa_3", "tck_mnzj_mo_fa_4", "tck_mnzj_mo_fa_5"],
      magicContent: {
        async tck_mnzj_mo_fa_1(event, trigger, player, prompt2) {
          const res1 = await player.chooseToDiscard(`你可以弃置2张黑色手牌发动魔法`, 2, "h", card => get.color(card) == "black")
            .set('prompt2', `【${get.translation("tck_mnzj_mo_fa_1")}】：${prompt2}`).forResult()
          if (res1.bool) {
            const res2 = await player.chooseTarget("请选择魔法使用的目标", true).set('prompt2', prompt2).forResult()
            if (res2.bool) {
              const target = res2.targets[0]
              player.line(target)
              await target.addTempSkill("tck_mnzj_mo_fa_1deeffect", { player: "phaseJieshuAfter" })
            }
          }
        },
        async tck_mnzj_mo_fa_2(event, trigger, player, prompt2) {
          const res1 = await player.chooseToDiscard(`你可以弃置1张红色手牌发动魔法`, 1, "h", card => get.color(card) == "red")
            .set('prompt2', `【${get.translation("tck_mnzj_mo_fa_2")}】：${prompt2}`).forResult()
          if (res1.bool) {
            const res2 = await player.chooseTarget("请选择魔法使用的目标", true).set('prompt2', prompt2).forResult()
            if (res2.bool) {
              const target = res2.targets[0]
              player.line(target)
              await player.discardPlayerCard(target, 1, true, "visible")
            }
          }
        },
        async tck_mnzj_mo_fa_3(event, trigger, player, prompt2) {
          const res1 = await player.chooseToDiscard(`你可以弃置3张不同花色的手牌发动魔法`, 3, "h")
            .set('filterCard', (card, player) => {
              return !ui.selected.cards.some((cardx) => get.suit(cardx, player) == get.suit(card, player))
            })
            .set('complexCard', true)
            .set('prompt2', `【${get.translation("tck_mnzj_mo_fa_3")}】：${prompt2}`)
            .forResult()
          if (res1.bool) {
            const res2 = await player.chooseTarget("请选择魔法使用的目标", true).set('prompt2', prompt2).forResult()
            if (res2.bool) {
              const target = res2.targets[0]
              target.storage.tck_mnzj_mo_fa_3phaseBeginStart = player
              await target.addSkill(["tck_mnzj_mo_fa_3phaseBeginStart", "tck_mnzj_mo_fa_3phaseJieshu"])
            }
          }
        },
        async tck_mnzj_mo_fa_4(event, trigger, player, prompt2) {
          const res1 = await player.chooseToDiscard(`你可以弃置4张不同花色的牌发动魔法`, 4, "he")
            .set('filterCard', (card, player) => {
              return !ui.selected.cards.some((cardx) => get.suit(cardx, player) == get.suit(card, player))
            })
            .set('complexCard', true)
            .set('prompt2', `【${get.translation("tck_mnzj_mo_fa_4")}】：${prompt2}`)
            .forResult()
          if (res1.bool) {
            const res2 = await player.chooseTarget("请选择魔法使用的目标", true).set('prompt2', prompt2).forResult()
            if (res2.bool) {
              const target = res2.targets[0]
              const randomChar = Object.keys(lib.character).randomGet()
              await target.reinitCharacter(target.name, randomChar)
            }
          }
        },
        async tck_mnzj_mo_fa_5(event, trigger, player, prompt2) {
          await player.loseMaxHp(1)
          const res1 = await player.chooseTarget("请选择使用魔法的目标", true, (card, player, target) => player != target).set('prompt2', prompt2).forResult()
          if (res1.bool) {
            const target = res1.targets[0]
            const { note } = lib.skill.tck_mnzj_mo_fa.getMagicNote(target)
            const magicContent = lib.skill.tck_mnzj_mo_fa.magicContent
            const res2 = await player
              .chooseButton([
                '【魔法笔记】：请选择一个该角色使用的魔法',
                [note.filter(note => note[0] != "tck_mnzj_mo_fa_5"), "textbutton"]
              ], true)
              .forResult()
            if (res2.bool) {
              if (!res2.links[0]) return
              const prompt2 = get.translation(`${res2.links[0]}_info`)
              switch (res2.links[0]) {
                case 'tck_mnzj_mo_fa_1':
                  await magicContent.tck_mnzj_mo_fa_1(event, trigger, target, prompt2)
                  break;
                case 'tck_mnzj_mo_fa_2':
                  await magicContent.tck_mnzj_mo_fa_2(event, trigger, target, prompt2)
                  break
                case 'tck_mnzj_mo_fa_3':
                  await magicContent.tck_mnzj_mo_fa_3(event, trigger, target, prompt2)
                  break
                case 'tck_mnzj_mo_fa_4':
                  await magicContent.tck_mnzj_mo_fa_4(event, trigger, target, prompt2)
                  break
              }
            }
          }
        }
      },
      subSkill: {
        "1deeffect": {
          mark: true,
          marktext: "魔",
          intro: {
            name: "幻觉",
            content: "本轮出一张牌前应先弃一张牌",
          },
          nopop: true,
          sub: true,
          forced: true,
          charlotte: true,
          popup: false,
          sourceSkill: "tck_mnzj_mo_fa",
          trigger: {
            player: "useCardBegin"
          },
          async content(event, trigger, player) {
            console.log(trigger)
            await player.chooseToDiscard("he", 1, true, card => !trigger.card.cards.includes(card))
          },
          mod: {
            cardEnabled2(card, player) {
              if (player.countCards("he") < 2) {
                return false;
              }
            },
          },
        },
        "3phaseBeginStart": {
          mark: true,
          marktext: "魔",
          intro: {
            name: "被操纵",
            content(storage, player) {
              return `下回合由${get.translation(storage)}操作`
            }
          },
          nopop: true,
          sub: true,
          forced: true,
          charlotte: true,
          popup: false,
          sourceSkill: "tck_mnzj_mo_fa",
          trigger: {
            player: "phaseBeginStart"
          },
          async content(event, trigger, player) {
            game.broadcastAll(player.changeTckTrueMe(player.storage.tck_mnzj_mo_fa_3phaseBeginStart, player))
          },
        },
        "3phaseJieshu": {
          nopop: true,
          sub: true,
          forced: true,
          charlotte: true,
          popup: false,
          sourceSkill: "tck_mnzj_mo_fa",
          trigger: {
            player: "phaseJieshuAfter"
          },
          async content(event, trigger, player) {
            game.broadcastAll(player.clearTckTrueMe())
            delete player.storage.tck_mnzj_mo_fa_3phaseBeginStart
            await player.removeSkill(["tck_mnzj_mo_fa_3phaseBeginStart", "tck_mnzj_mo_fa_3phaseJieshu"])
            await player.addTempSkill("tck_mnzj_mo_fa_3deeffect", { player: "phaseZhunbeiBefore" })
          },
        },
        "3deeffect": {
          mark: true,
          marktext: "魔",
          intro: {
            name: "被操纵",
            content: "不能打出牌"
          },
          nopop: true,
          sub: true,
          forced: true,
          charlotte: true,
          popup: false,
          sourceSkill: "tck_mnzj_mo_fa",
          mod: {
            cardEnabled2(card, player) {
              return false
            },
          },
        },
      },
    },
  },
  translate: {
    "tck_mnzj_mo_fa_1": "使人见到幻觉",
    "tck_mnzj_mo_fa_1_info": "令一人一轮出一张牌前应先弃一张牌。",
    "tck_mnzj_mo_fa_1_condition": "弃2张黑色手牌。",
    "tck_mnzj_mo_fa_2": "窥视人心",
    "tck_mnzj_mo_fa_2_info": "查看一人手牌，并弃置其一张牌。",
    "tck_mnzj_mo_fa_2_condition": "弃1张红色手牌。",
    "tck_mnzj_mo_fa_3": "操纵人体",
    "tck_mnzj_mo_fa_3_info": "指定一人其下回合由你操作，且在其之前，其不能打出牌。",
    "tck_mnzj_mo_fa_3_condition": "弃置3种不同花色的手牌。",
    "tck_mnzj_mo_fa_4": "交换身体",
    "tck_mnzj_mo_fa_4_info": "替换将牌。",
    "tck_mnzj_mo_fa_4_condition": "弃4种不同花色的牌。",
    "tck_mnzj_mo_fa_5": "给予魔法",
    "tck_mnzj_mo_fa_5_info": "令一人也能发动你选择的除本项的一项魔法。",
    "tck_mnzj_mo_fa_5_condition": "你失去1点体力上限。",
    "tck_mnzj_tun_shi": "吞噬",
    "tck_mnzj_tun_shi_info": "有人濒死时，你令其判定，若为♣，其直接死亡，有人死亡时，你加1点体力上限和体力。",
    "tck_mnzj_mo_fa": "魔法",
    "tck_mnzj_mo_fa_info": "出牌阶段限一次，你可从“魔法笔记”中选择一个魔法，根据其发动条件执行魔法。",
    "tck_mnzj_jue_fen": "绝愤",
    "tck_mnzj_jue_fen_info": "出牌阶段限一次，你可弃一张牌，将场景改为“魔女之家·绝”。",
    "tck_mnzj_after_jue_wang": "绝望",
    "tck_mnzj_after_jue_wang_info": "你濒死时或回合开始时，你可以失去1点体力上限，将体力回复至满，你登场时，将牌堆中的“绝望”替换为“见证”。",
    "tck_mnzj_yin_dao": "引导",
    "tck_mnzj_yin_dao_info": "出牌阶段限一次，你可弃1张牌，将场景改为“魔女之家”。",
    "tck_mnzj_jue_wang": "绝望",
    "tck_mnzj_jue_wang_info": "回合开始，你将体力回复至上限，游戏开始，你将3张“绝望”加入牌堆，当你摸到“绝望”后，你立即死亡。",
    "tck_mnzj_wei_shan": "伪善",
    "tck_mnzj_wei_shan_info": "出牌阶段限一次，你可指定一人，令其回复一点体力，然后其选择一项：①流失2点体力，②弃2张牌。",
    "tck_mnzj_de_cheng": "得逞",
    "tck_mnzj_de_cheng_info": "你使用锦囊牌时，若此牌为黑色，则不能响应；若为红色，你摸1张牌。",
    "tck_mnzj_dan_chun": "单纯",
    "tck_mnzj_dan_chun_info": "锁定技，其他人对你用锦囊时，应进行判定，若为黑色，你不能响应该锦囊，若为红色，来源需弃1张手牌，否则该锦囊失效。",
    "tck_mnzj_xin_shan": "心善",
    "tck_mnzj_xin_shan_info": "出牌阶段限1次，你可指定一人回复1点体力并摸1张牌，若其为满体力，则改为摸3张牌。",
  }
}
export default mnzj_skills