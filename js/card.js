import { lib, game, get, _status, ui } from "../../../noname.js";
export const cards = {
  card: {
    "tck_tou_xiang": {
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: -1,
      toSelf: true,    //是否自己使用
      //只能对自己用
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        await event.target.die()
      },
      image: "ext:TCK/imgs/cards/tck_tou_xiang.png",
      fullskin: true,
    },
    "tck_chang_qu_zhi_ru": {
      image: "ext:TCK/imgs/cards/tck_chang_qu_zhi_ru.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: 1,
      toSelf: false,    //是否自己使用
      //必须写filterTarget
      filterTarget(card, player, target) {
        return player != target;
      },
      async content(event, trigger, player) {
        await event.target.damage(player, 1)
      },
      // 标识带伤害标签的牌
      ai: {
        tag: {
          damage: 1
        }
      }
    },
    "tck_tian_jiang_de_bao_zha": {
      image: "ext:TCK/imgs/cards/tck_tian_jiang_de_bao_zha.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: 1,
      toSelf: false,    //是否自己使用
      //必须写filterTarget
      filterTarget(card, player, target) {
        return player != target;
      },
      async content(event, trigger, player) {
        let playerDrawNum = 6 - await player.countCards("h")
        let targetDrawNum = 6 - await event.target.countCards("h")
        if (playerDrawNum > 0) await player.draw(playerDrawNum)
        if (targetDrawNum > 0 && event.target != player) await event.target.draw(targetDrawNum)
      }
    },
    "tck_mo_long_zhan_yue": {
      image: "ext:TCK/imgs/cards/tck_mo_long_zhan_yue.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip1",           // 武器
      skills: ["tck_mo_long_zhan_yue_skill_1", "tck_mo_long_zhan_yue_skill_2"],  // 装备技能
      distance: {               // 距离修正
        attackFrom: -1,       // 攻击距离
      },
    },
    "tck_zuan_shi_jian": {
      image: "ext:TCK/imgs/cards/tck_zuan_shi_jian.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip1",           // 武器
      skills: ["tck_zuan_shi_jian_skill"],  // 装备技能
      distance: {               // 距离修正
        attackFrom: -2,       // 攻击距离
      },
    },
    "tck_scp_127": {
      image: "ext:TCK/imgs/cards/tck_scp_127.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip1",           // 武器
      skills: ["tck_scp_127_skill"],  // 装备技能
      distance: {               // 距离修正
        attackFrom: -Infinity,       // 攻击距离
      },
    },
    "tck_lei_yin_ce_dian": {
      image: "ext:TCK/imgs/cards/tck_lei_yin_ce_dian.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip2",           // 武器
      skills: ["tck_lei_yin_ce_dian_skill1", "tck_lei_yin_ce_dian_skill2"],  // 装备技能
    },
    "tck_hu_tao": {
      image: "ext:TCK/imgs/cards/tck_hu_tao.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip3",           // 防御马
      distance: {
        globalTo: 1,
      },
      skills: ["tck_hu_tao_skill"],  // 装备技能
    },
    "tck_bai_niao_chao_feng_qiang": {
      image: "ext:TCK/imgs/cards/tck_bai_niao_chao_feng_qiang.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip1",           // 防御马
      distance: {               // 距离修正
        attackFrom: -3,       // 攻击距离
      },
      skills: ["tck_bai_niao_chao_feng_qiang_skill"],  // 装备技能
    },
    "tck_xjx_de_zeng_li": {
      image: "ext:TCK/imgs/cards/tck_xjx_de_zeng_li.png",
      fullskin: true,
      type: "delay",               // 判定牌
      //装备牌默认只能对自己用
      filterTarget(card, player, target) {
        return !target.hasJudge('tck_xjx_de_zeng_li');  // 判断目标是否已有同名判定牌
      },
      judge(card) {    // 判定函数
        if (get.suit(card) == 'heart') return 2;
        if (get.suit(card) == 'diamond') return 1;
        return -1;
      },
      effect() {          // 判定效果
        if (result.bool) {
          if (result.suit == 'heart')
            player.draw(2);
          if (result.suit == 'diamond')
            player.draw(1);
        }
      },
    },
    "tck_ti_xing_chong_su": {
      image: "ext:TCK/imgs/cards/tck_ti_xing_chong_su.png",
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
        let res = await event.target.judge((card) => {
          if (card.color == "red") return 1
          else if (card.color == "black") return -1
          else return 0
        }).forResult()
        if (res.color == "red") {
          await event.target.gainMaxHp(1)
        } else if (res.color == "black") {
          await event.target.loseMaxHp(1)
        }
      }
    },
    "tck_ku_rou_ji": {
      image: "ext:TCK/imgs/cards/tck_ku_rou_ji.png",
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
        await event.target.addTempSkill("kurou", { player: "phaseJieshuAfter" })
      }
    },
    "tck_da_ri_zhao": {
      image: "ext:TCK/imgs/cards/tck_da_ri_zhao.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_da_ri_zhao")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_chang_di_po_huai": {
      image: "ext:TCK/imgs/cards/tck_chang_di_po_huai.png",
      fullskin: true,
      type: "trick",   //锦囊
      notarget: true, //无目标
      enable: function (card, player) {
        return ui.land || lib.skill.global.some(skill => skill.includes("tckland")) || _status.tckLand.length > 0
      },
      async content(event, trigger, player) {
        if (get.land("tck_scp_002")) return
        if (ui.land) {
          ui.land.destroy()
          let card = _status.tckLand[0]
          if (card) {
            game.log(card, "进入了弃牌堆")
            await game.cardsDiscard(card).set("outRange", true).set("fromTckLand", true);
          }
        }
      }
    },
    "tck_shang_tang": {
      image: "ext:TCK/imgs/cards/tck_shang_tang.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: true,
      selectTarget: 1,
      toSelf: false,    //是否自己使用
      //必须写filterTarget
      filterTarget(card, player, target) {
        return player != target;
      },
      async content(event, trigger, player) {
        let targetCards = await event.target.getCards("h")
        let playerCards = await player.getCards("h")
        let targetDrawNum = targetCards.length
        let playerDrawNum = playerCards.length
        await player.discard(playerCards)
        await event.target.discard(targetCards)
        await player.draw(playerDrawNum)
        await event.target.draw(targetDrawNum)
      }
    },
    "tck_hun_shui_mo_yu": {
      image: "ext:TCK/imgs/cards/tck_hun_shui_mo_yu.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: true,
      selectTarget: 1,
      toSelf: false,    //是否自己使用
      //必须写filterTarget
      filterTarget(card, player, target) {
        return player != target && target.countCards("hej") > 0
      },
      async content(event, trigger, player) {
        await player.gainPlayerCard(event.target, "hej", true, 2).set('prompt', '获得目标2张牌')
        await player.chooseToGive(event.target, "hej", true, 1).set('prompt', '选择一张牌归还')
      }
    },
    "tck_xian_zhen": {
      image: "ext:TCK/imgs/cards/tck_xian_zhen.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: true,
      notarget: true, //无目标,写了就不用写filterTarget
      async content(event, trigger, player) {
        let res = await player.chooseCard("he", true, 1).set('prompt', '请弃置一张牌').forResult()
        await player.discard(res.cards)
        let targets = game.players.filter(target => target != player).filter(target => target.countCards("hej") > 0)
        targets.forEach(async target => await player.discardPlayerCard(target, "hej", true))
      }
    },
    "tck_sen_lin": {
      image: "ext:TCK/imgs/cards/tck_sen_lin.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_sen_lin")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_scp_002": {
      image: "ext:TCK/imgs/cards/tck_scp_002.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_scp_002")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_yue_mian": {
      image: "ext:TCK/imgs/cards/tck_yue_mian.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_yue_mian")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_meng_hua": {
      image: "ext:TCK/imgs/cards/tck_meng_hua.png",
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
        await event.target.addTempSkill("tck_meng_hua_skill", { player: "phaseJieshuAfter" })
      }
    },
    "tck_bu_tian_shi": {
      image: "ext:TCK/imgs/cards/tck_bu_tian_shi.png",
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
        let cards = await event.target.getCards("he")
        await event.target.discard(cards)
        await event.target.draw(7)
      }
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
    "tck_huang_tian_dang_li": {
      image: "ext:TCK/imgs/cards/tck_huang_tian_dang_li.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      //有手牌才能展示
      enable: function (card, player) {
        return player.countCards("h") > 1;
      },
      selectTarget: -1,
      toSelf: true,    //是否自己使用
      //只能对自己用
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        let cards = await event.target.getCards("h")
        await event.target.showHandcards()
        if (!cards.some(card => get.name(card) == "shan")) {
          await event.target.draw(3)
        }
      }
    },
    "tck_liu_xing_cha_hua": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_cha_hua.png",
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
        await event.target.recover(1)
        await event.target.gainMaxHp(1)
        let res = await event.target.judge((card) => {
          if (card.color == "red") return 1
          return -1
        }).forResult()
        if (res.color == 'red') await event.target.recover(1)
      }
    },
    "tck_liu_xing_yu_de_gong_yuan": {
      image: "ext:TCK/imgs/cards/tck_liu_xing_yu_de_gong_yuan.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_liu_xing_yu_de_gong_yuan")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_chun_ri_tian_lai_le": {
      image: "ext:TCK/imgs/cards/tck_chun_ri_tian_lai_le.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_chun_ri_tian_lai_le")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_shi": {
      type: "basic",
      image: "ext:TCK/imgs/cards/tck_shi.png",
      fullskin: true,
      global: ["tck_shi_skill"],
      enable: true,
      selectTarget: 1,
      filterTarget: true,
      async content(event, trigger, player) {
        let target = event.target
        if (target == player) {
          let res = await target
            .chooseButton([
              '请选择一项',
              [[
                ["①", `减1体力上限并加1体力`],
                ["②", `减1体力并摸2张牌`],
              ], "textbutton",]
            ], true)
            .forResult();
          if (res.bool) {
            switch (res.links[0]) {
              case '①':
                await player.loseMaxHp(1)
                await player.recover(1)
                break;
              case '②':
                await player.loseHp(1)
                await player.draw(2)
                break;
            }
          }
        } else {
          await target.loseHp(1)
          await target.chooseToDiscard("请弃置一张牌", "he", 1, true)
        }
      },
    },
    "tck_pi": {
      type: "basic",
      image: "ext:TCK/imgs/cards/tck_pi.png",
      fullskin: true,
      global: ["tck_pi_skill"],
      content() { },
    },
    "tck_yi_dui_fang_yu_ma": {
      image: "ext:TCK/imgs/cards/tck_yi_dui_fang_yu_ma.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip3",           // 防御马
      distance: {
        globalTo: 2,
      }
    },
    "tck_wu_qie": {
      image: "ext:TCK/imgs/cards/tck_wu_qie.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip5",
      skills: ["tck_wu_qie_skill_1", "tck_wu_qie_skill_2", "tck_wu_qie_skill_3"],  // 装备技能
      distance: {               // 距离修正
        attackFrom: -2,       // 攻击距离
      },
    },
    "tck_yu_hang_fu": {
      image: "ext:TCK/imgs/cards/tck_yu_hang_fu.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "tck_fj",
      allowMultiple: false,
    },
    "tck_qian_shui_fu": {
      image: "ext:TCK/imgs/cards/tck_qian_shui_fu.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "tck_ex",          //防具
    },
    "tck_xue_zhan_dao_di": {
      image: "ext:TCK/imgs/cards/tck_xue_zhan_dao_di.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_xue_zhan_dao_di")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_scp_087": {
      image: "ext:TCK/imgs/cards/tck_scp_087.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_scp_087")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_dong_xue": {
      image: "ext:TCK/imgs/cards/tck_dong_xue.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_dong_xue")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_you_zhong_sheng_wu": {
      image: "ext:TCK/imgs/cards/tck_you_zhong_sheng_wu.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: 1,
      filterTarget(card, player, target) {
        return target.countCards("h") > 0;
      },
      async content(event, trigger, player) {
        let res = await event.target.chooseCard("h", true, 2).set('prompt', '请弃置2张手牌').forResult()
        await event.target.discard(res.cards)
      }
    },
    "tck_gu_zhu_yi_zhi": {
      image: "ext:TCK/imgs/cards/tck_gu_zhu_yi_zhi.png",
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
        await event.target.addTempSkill("tck_gu_zhu_yi_zhi_skill", { player: "phaseJieshuAfter" })
        await event.target.draw(10)
      }
    },
    "tck_shou_zha_hu_huan": {
      image: "ext:TCK/imgs/cards/tck_shou_zha_hu_huan.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: 1,
      filterTarget(card, player, target) {
        return target != player
      },
      async content(event, trigger, player) {
        let playerCards = await player.getCards("h")
        let targetCards = await event.target.getCards("h")
        player.gain(targetCards)
        event.target.gain(playerCards)
      }
    },
    "tck_mang_zhong_chu_cuo": {
      type: "trick",
      image: "ext:TCK/imgs/cards/tck_mang_zhong_chu_cuo.png",
      fullskin: true,
      global: ["tck_mang_zhong_chu_cuo_skill"],
      content() { },
    },
    "tck_qi_xiao": {
      image: "ext:TCK/imgs/cards/tck_qi_xiao.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_qi_xiao")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_wu": {
      type: "basic",
      fullskin: true,
      image: "ext:TCK/imgs/cards/tck_wu.png",
      enable: false,   //可以用
    },
    "tck_she_jin_qiu_yuan": {
      image: "ext:TCK/imgs/cards/tck_she_jin_qiu_yuan.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: function (card, player) {
        return player.countCards("he") > 1;
      },
      //不能对自己用，目标需要有牌
      filterTarget(card, player, target) {
        return target != player && target.countCards("hej") > 0;
      },
      async content(event, trigger, player) {
        let res = await player.chooseCard("he", true, 1).set('prompt', '请弃置一张牌').forResult()
        await player.discard(res.cards)
        await player.gainPlayerCard(event.target, "hej", 1, true)
      }
    },
    "tck_wu_zhong_sheng_you_ex": {
      type: "trick",   //锦囊牌
      enable: true,   //可以用
      selectTarget: -1,
      toSelf: true,    //是否自己使用
      //只能对自己用
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        let cards = event.target.getCards("h", card => get.name(card) == "tck_wu")
        if (cards.length) {
          await event.target.discard(cards)
          await event.target.draw(4)
        } else {
          await event.target.draw(2)
        }

      },
      image: "ext:TCK/imgs/cards/tck_wu_zhong_sheng_you_ex.png",
      fullskin: true,
    },
    "tck_po_fu_chen_zhou": {
      image: "ext:TCK/imgs/cards/tck_po_fu_chen_zhou.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: function (card, player) {
        return player.countCards("h") > 1;
      },
      //不能对自己用，目标要有手牌
      filterTarget(card, player, target) {
        return target != player && target.countCards("h") > 0;
      },
      async content(event, trigger, player) {
        let discardNum = Math.floor(await player.countCards("h") / 2)
        if (discardNum <= 0) discardNum = 1
        let res = await player.chooseCard("h", true, discardNum).set('prompt', `请弃置${discardNum}张手牌`).forResult()
        await player.discard(res.cards)
        let targetCards = await event.target.getCards("h")
        await event.target.discard(targetCards)
      }
    },
    "tck_fang_yu_ma": {
      image: "ext:TCK/imgs/cards/tck_fang_yu_ma.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip3",           // 防御马
      distance: {
        globalTo: 1,
      },
    },
    "tck_jin_gong_ma": {
      image: "ext:TCK/imgs/cards/tck_jin_gong_ma.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip4",           // 进攻马
      distance: {
        globalFrom: -1,
      },
    },
    "tck_po_di_qian_qi": {
      image: "ext:TCK/imgs/cards/tck_po_di_qian_qi.png",
      fullskin: true,
      type: "trick",               // 锦囊牌
      enable: function (card, player) {
        return game.players.some(player => player.countCards("e", card => get.subtype(card) == "equip4" || get.subtype(card) == "equip3")) > 0
      },
      notarget: true, //无目标,写了就不用写filterTarget
      async content(event, trigger, player) {
        let players = game.players
        players.forEach(async player => {
          await player.discard(await player.getCards("e", card => get.subtype(card) == "equip4" || get.subtype(card) == "equip3"))
        })
      },
    },
    "tck_shen_wang_dun": {
      image: "ext:TCK/imgs/cards/tck_shen_wang_dun.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip2",           // 防具
      skills: ["tck_shen_wang_dun_skill"],  // 装备技能
    },
    "tck_lun_tai": {
      image: "ext:TCK/imgs/cards/tck_lun_tai.png",
      fullskin: true,
      type: "delay",               // 判定牌
      filterTarget(card, player, target) {
        return !target.hasJudge('tck_lun_tai') && player != target;  // 判断目标是否已有同名判定牌
      },
      judge(card) {    // 判定函数
        if (get.suit(card) == 'heart' || get.suit(card) == 'club' || get.suit(card) == 'diamond') return -2;
        if (get.suit(card) == 'spade') return -1;
        return 1;
      },
      effect() {          // 判定效果
        if (result.suit == 'heart')
          player.loseHp(1);
        if (result.suit == 'diamond')
          player.addTempSkill("tck_lun_tai_skill_diamond", { player: "phaseJieshuAfter" })
        if (result.suit == 'club')
          player.addTempSkill("tck_lun_tai_skill_club", { player: "phaseJieshuAfter" })
        if (result.suit == 'spade')
          player.addTempSkill("tck_lun_tai_skill_spade", { player: "phaseJieshuAfter" })
      },
    },
    "tck_fan_hui": {
      image: "ext:TCK/imgs/cards/tck_fan_hui.png",
      fullskin: true,
      type: "trick",               // 锦囊牌
      notarget: true,
      async content(event, trigger, player) {
      },
      global: "tck_fan_hui_skill"
    },
    "tck_hai_di": {
      image: "ext:TCK/imgs/cards/tck_hai_di.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_hai_di")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_ba_la_la_mo_xian_bang": {
      image: "ext:TCK/imgs/cards/tck_ba_la_la_mo_xian_bang.png",
      fullskin: true,
      type: "delay",               // 判定牌
      filterTarget(card, player, target) {
        return !target.hasJudge('tck_ba_la_la_mo_xian_bang');  // 判断目标是否已有同名判定牌
      },
      judge(card) {    // 判定函数
        if (get.color(card) == 'red' || get.color(card) == 'black') return 1;
        return -1;
      },
      effect() {          // 判定效果
        if (result.color == 'red')
          player.addTempSkill("tck_ba_la_la_mo_xian_bang_skill_red", { player: "phaseJieshuAfter" })
        if (result.color == 'black')
          player.addTempSkill("tck_ba_la_la_mo_xian_bang_skill_black", { player: "phaseJieshuAfter" })
      },
    },
    "tck_tan_nang_qu_wu": {
      image: "ext:TCK/imgs/cards/tck_tan_nang_qu_wu.png",
      fullskin: true,
      type: "trick",
      enable: true,
      selectTarget: 1,
      filterTarget(card, player, target) {
        return player != target && target.countCards("hej") > 0
      },
      async content(event, trigger, player) {
        await player.gainPlayerCard("hej", event.target, true).set("target", event.target)
      },
    },
    "tck_land_yi_ji": {
      image: "ext:TCK/imgs/cards/tck_land_yi_ji.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_land_yi_ji")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_yu_qin_gu_zong": {
      image: "ext:TCK/imgs/cards/tck_yu_qin_gu_zong.png",
      fullskin: true,
      type: "trick",   //锦囊
      enable: true,
      selectTarget: 1,
      toSelf: false,    //是否自己使用
      //必须写filterTarget
      filterTarget(card, player, target) {
        return player != target
      },
      async content(event, trigger, player) {
        await event.target.draw(1)
        let playerName = get.translation(player)
        let prompt = `交给${playerName}两张牌`
        let options = ['减1点体力', prompt]
        let result = await event.target.chooseControl(options)
          .forResult();
        switch (result.control) {
          case '减1点体力':
            await event.target.loseHp(1);
            break;
          case prompt:
            await event.target.chooseToGive(player, 2, true, "he")
            break;
        }
      }
    },
    "tck_tong_ling_yi_shi": {
      image: "ext:TCK/imgs/cards/tck_tong_ling_yi_shi.png",
      fullskin: true,
      type: "trick",   //锦囊牌
      selectTarget: -1,
      toSelf: true,    //是否自己使用
      enable: true,
      //只能对自己用,弃牌堆要有牌
      filterTarget(card, player, target) {
        return target == player
      },
      async content(event, trigger, player) {
        await event.target.loseHp(1)
        event.togain = [];
        for (var i = 0; i < ui.discardPile.childNodes.length; i++) {
          let current = ui.discardPile.childNodes[i];
          event.togain.push(current);
        }
        if (event.togain.length > 0 && player.isAlive()) {
          let res = await event.target.chooseButton(true, [0, 2], [`是否获得其中的至多2张牌？`, event.togain]).forResult()
          if (res.bool) {
            await event.target.gain(res.links, "draw");
          }
        } else {
          await game.delay(1)
          await player.chat(`弃牌堆中没有牌`)
          await game.delay(2)
        }
      }
    },
    "tck_gou_tong": {
      image: "ext:TCK/imgs/cards/tck_gou_tong.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_gou_tong")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_dou": {
      image: "ext:TCK/imgs/cards/tck_dou.png",
      fullskin: true,
      type: "basic",
      enable: true,
      selectTarget: 1,
      filterTarget(card, player, target) {
        return player !== target;
      },
      async content(event, trigger, player) {
        event.shanRequired = 1; //设置闪次数
        if (event.directHit || event.directHit2 || (!_status.connectMode && lib.config.skip_shan && !event.target.hasShan())) {
          event._result = { bool: false };
        } else if (event.skipShan) {
          event._result = { bool: true, result: "shaned" };
        } else {
          let res = await event.target.chooseToUse("请使用一张闪响应斗")
            .set("type", "respondShan")
            .set("filterCard", (card, player) => {
              if (get.name(card) != "shan") {
                return false;
              }
              return lib.filter.cardEnabled(card, player, "forceEnable");
            })
            .set("shanRequired", event.shanRequired)
            .set("respondTo", [player, event.card])
            .forResult()
          if (!res || !res.bool || !res.result || res.result !== "shaned") {
            //没有用闪触发斗的效果
            let result = await player.chooseToPSS(event.target).forResult()
            if (result.bool) {
              //赢
              await event.target.damage(player, 1)
            }
          }
        }
      },
      ai: {
        tag: {
          damage: 1
        }
      }
    },
    "tck_tou_liang_huan_zhu": {
      image: "ext:TCK/imgs/cards/tck_tou_liang_huan_zhu.png",
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
        await event.target.draw(2)
        let res1 = await event.target.chooseCard("he", true, 2).set('prompt', '请弃置2张牌').forResult()
        await event.target.discard(res1.cards)
        if (res1.cards.every(card => get.type(card) == "basic" && get.type(card) == get.type(res1.cards[0]))) {
          //均为基本牌
          //选择一名角色摸一弃一
          let res2 = await event.target.chooseTarget("请选择一名角色摸1弃1").forResult()
          if (res2.bool) {
            await res2.targets[0].draw(1)
            let res = await res2.targets[0].chooseCard("he", true, 1).set('prompt', '请弃置一张牌').forResult()
            await res2.targets[0].discard(res.cards)
          }
        }
      },

    },
    "tck_wen_yi": {
      image: "ext:TCK/imgs/cards/tck_wen_yi.png",
      fullskin: true,
      type: "delay",               // 判定牌
      filterTarget(card, player, target) {
        return !target.hasJudge('tck_ba_la_la_mo_xian_bang');  // 判断目标是否已有同名判定牌
      },
      judge(card) {    // 判定函数
        if (get.suit(card) != 'heart') return -1;
        return 1;
      },
      effect() {          // 判定效果
        if (result.suit != 'heart') {
          player.loseHp(1)
          player.addJudgeNext(card)
        }
      },
      cancel() {
        player.addJudgeNext(card)
      }
    },
    "tck_hu_fu": {
      image: "ext:TCK/imgs/cards/tck_hu_fu.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip2",           // 防具
      skills: ["tck_hu_fu_skill"],  // 装备技能
    },
    "tck_gong_dian_chang": {
      image: "ext:TCK/imgs/cards/tck_gong_dian_chang.png",
      fullskin: true,
      type: "land",   //场地牌
      enable: true,
      notarget: true, //无目标
      async content(event, trigger, player) {
        player.changeTckLand("tck_gong_dian_chang")
        game.cardsGotoSpecial(event.card.cards, "toTckLand")
      }
    },
    "tck_suo_xie": {
      image: "ext:TCK/imgs/cards/tck_suo_xie.png",
      fullskin: true,
      type: "equip",               // 装备牌
      subtype: "equip2",           // 防具
      skills: ["tck_suo_xie_skill"],  // 装备技能
      async content(event) {
        const { card, target } = event;
        await target.loseHp(target.hp - 1)
        await target.equip(card);
      },
    },
    "tck_li": {
      image: "ext:TCK/imgs/cards/tck_li.png",
      fullskin: true,
      toself: true,
      enable(card, player) {
        return player.isDamaged();
      },
      savable: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return target === player && target.isDamaged();
      },
      modTarget(card, player, target) {
        return target.isDamaged();
      },
      type: "basic",
      async content(event, trigger, player) {
        await event.target.recover()
        await event.target.draw(1)
      }
    },
    "tck_ju": {
      image: "ext:TCK/imgs/cards/tck_ju.png",
      fullskin: true,
      type: "basic",
      toself: true,
      enable(card, player) {
        return player.isDamaged();
      },
      savable: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return target === player && target.isDamaged();
      },
      modTarget(card, player, target) {
        return target.isDamaged();
      },
      async content(event, trigger, player) {
        await event.target.recover()
        let res = await event.player.judge(card => {
          if (get.suit(card) == 'heart') {
            return -1
          } return 1
        }).forResult()
        if (get.suit(res) == 'heart') {
          await event.player.damage(1, 'fire')
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
    // "tck_duo": {
    //   image: "ext:TCK/imgs/cards/tck_duo.png",
    //   fullskin: true,
    //   type: "basic",
    //   notarget: true,
    //   nodelay: true,
    //   content() {
    //     event.result = "shaned";
    //     event.getParent().delayx = false;
    //     game.delay(0.5);
    //   },
    //   // async content(event, trigger, player) {
    //   //   // todo 看闪的代码
    //   // }
    // },
    "tck_xiang_jiao": {
      image: "ext:TCK/imgs/cards/tck_xiang_jiao.png",
      fullskin: true,
      type: "basic",
      toself: true,
      global: ["tck_xiang_jiao_pi_skill"],
      enable(card, player) {
        return player.isDamaged();
      },
      savable: true,
      selectTarget: -1,
      filterTarget(card, player, target) {
        return target === player && target.isDamaged();
      },
      modTarget(card, player, target) {
        return target.isDamaged();
      },
      async content(event, trigger, player) {
        await event.target.recover(1)
        event.card.cards[0].init({
          name: "tck_xiang_jiao_pi",
          number: get.number(event.card.cards[0]),
          suit: get.suit(event.card.cards[0]),
        })
        await game.cardsGotoPile(event.card.cards[0],
          (event2, card) => {
            const pile = ui.cardPile
            const len = pile.childNodes.length
            const randomIndex = Math.floor(Math.random() * (len + 1))
            return pile.childNodes[randomIndex]
          }, "insert")
      }
    },
    "tck_xiang_jiao_pi": {
      type: "basic",
      image: "ext:TCK/imgs/cards/tck_xiang_jiao_pi.png",
      fullskin: true,
      global: ["tck_xiang_jiao_pi_skill"],
      content() { },
    },
  },
  //装备技能&场地技能&卡牌附加技能
  skill: {
    "tck_xiang_jiao_pi_skill": {
      forced: true,
      cardSkill: true,
      trigger: {
        player: ["gainEnd"],
        global: ["phaseBefore"],
      },
      filter(event, player) {
        let cards = player.getCards("h");
        return cards.some(card => get.name(card) == "tck_xiang_jiao_pi")
      },
      async content(event, trigger, player) {
        let xjps = player.getCards("h").filter(card => get.name(card) == "tck_xiang_jiao_pi")
        await player.discard(xjps)
        await player.loseHp(xjps.length)
        xjps.forEach(card => card.init({
          name: "tck_xiang_jiao",
          number: get.number(card),
          suit: get.suit(card),
        }))
      }
    },
    "tck_suo_xie_skill": {
      equipSkill: true,
      //需（强制使用）
      forced: true,
      trigger: {
        player: "changeHpBegin"
      },
      async content(event, trigger, player) {
        trigger.num = 0
      }
    },
    "tck_gong_dian_chang_tckland_skill": {
      forced: true,
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      async content(event, trigger, player) {
        let res = await player.judge(
          card => {
            if (get.type(card) == "equip") return 0
            else if (get.suit(card) == "spade") return -2
            else if (get.suit(card) == "heart") return 2
            else if (get.suit(card) == "diamond") return 1
            else if (get.suit(card) == "club") return -1
          }
        ).forResult();
        if (get.type(res) == "equip") return
        else if (get.suit(res) == "spade") await player.damage(3)
        else if (get.suit(res) == "heart") await player.recover(2)
        else if (get.suit(res) == "diamond") await player.recover(1)
        else if (get.suit(res) == "club") await player.loseHp(player.hp)
      }
    },
    "tck_hu_fu_skill": {
      equipSkill: true,
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return Infinity;
          }
        },
      },
    },
    "tck_gou_tong_tckland_skill": {
      forced: true,
      trigger: {
        player: "phaseDrawBegin",
      },
      async content(event, trigger, player) {
        trigger.num = 0;
        while (true) {
          let res = await player.judge((card) => {
            if (get.type(card) == "trick" || get.type(card) == "delay") return -1
            return 1
          }).forResult()
          if (get.type(res.card) == "trick" || get.type(res.card) == "delay") {
            break
          }
          await player.gain(res.card, "gain2")
        }
      },
    },
    "tck_land_yi_ji_tckland_skill": {
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      async content(event, trigger, player) {
        let res = await player.judge((card) => {
          if (get.suit(card) == 'spade') return -1
          return 1
        }).forResult()
        let options = ['扣1颗血']
        if (player.countCards("he") > 0) {
          options.unshift('弃2张牌')
        }
        if (get.suit(res) == "spade") {
          let result = await player.chooseControl(options)
            .forResult();
          switch (result.control) {
            case '弃2张牌':
              let card = await player.chooseCard("he", true, 2).set('prompt', '请弃置2张牌').forResult()
              await player.discard(card.cards)
              break;
            case '扣1颗血':
              await player.loseHp(1);
              break;
          }
        }
      }
    },
    "tck_ba_la_la_mo_xian_bang_skill_red": {
      cardSkill: true,
      forced: true,
      mark: true,
      marktext: "小",
      intro: {
        name: "小魔仙",
        content: "当前为小魔仙，回合结束摸1张。"
      },
      trigger: {
        player: "phaseJieshu"
      },
      async content(event, trigger, player) {
        await player.draw()
      },
    },
    "tck_ba_la_la_mo_xian_bang_skill_black": {
      mark: true,
      marktext: "黑",
      intro: {
        name: "黑魔仙",
        content: "当前为黑魔仙，摸牌阶段额外摸1张。"
      },
      //多摸一张牌
      cardSkill: true,
      forced: true,
      trigger: {
        player: "phaseDrawBegin",
      },
      async content(event, trigger, player) {
        trigger.num++;
      },
    },
    "tck_hai_di_tckland_skill": {},
    "tck_hai_di_tckland_skill_1": {
      trigger: {
        player: "damageBegin",
      },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == "sha" && (get.nature(event.card) == "fire" || get.nature(event.card) == "thunder");
      },
      async content(event, trigger, player) {
        if (get.nature(trigger.card) == "fire") trigger.num = 0
        if (get.nature(trigger.card) == "thunder") trigger.num += 1
      }
    },
    "tck_hai_di_tckland_skill_2": {
      trigger: {
        player: "phaseJieshu"
      },
      forced: true,
      async content(event, trigger, player) {
        let cards = await player.getCards("e", (card) => {
          return get.name(card) == "tck_qian_shui_fu"
        })
        if (cards.length > 0) return  //如果是装备区内有潜水服，月面无效果
        await player.loseHp(1)
      }
    },
    "tck_fan_hui_skill": {
      cardSkill: true,
      trigger: {
        player: "useCard",
      },
      direct: true,
      filter(event, player) {
        let cards = player.getCards("h");
        return cards.some(card => {
          return get.name(card) == "tck_fan_hui"
        }) && get.name(event.card) != "tck_fan_hui"
      },
      async content(event, trigger, player) {
        let res = await player.chooseToUse(card => get.name(card) == "tck_fan_hui").set('prompt', '是否使用【反悔】？').forResult();
        if (res.bool) {
          await trigger.cancel()
          await player.gain(trigger.cards, "gain2")
        }
      },
    },
    "tck_lun_tai_skill_spade": {
      //少摸一张牌
      cardSkill: true,
      forced: true,
      trigger: {
        player: "phaseDrawBegin",
      },
      async content(event, trigger, player) {
        trigger.num--;
      },
    },
    "tck_lun_tai_skill_club": {
      //跳过出牌阶段
      cardSkill: true,
      forced: true,
      trigger: {
        player: "phaseUseBefore",
      },
      async content(event, trigger, player) {
        await trigger.cancel();
      },
    },
    "tck_lun_tai_skill_diamond": {
      //跳过摸牌阶段
      cardSkill: true,
      forced: true,
      trigger: {
        player: "phaseDrawBefore",
      },
      async content(event, trigger, player) {
        await trigger.cancel();
      },
    },
    "tck_meng_hua_skill": {
      cardSkill: true,
      forced: true,
      trigger: {
        player: "phaseDiscardBefore",
      },
      async content(event, trigger, player) {
        await trigger.cancel();
      },
    },
    "tck_shen_wang_dun_skill": {
      equipSkill: true,
      trigger: {
        target: "shaBegin",
      },
      forced: true,
      filter(event, player) {
        return event.card.name == "sha" && get.color(event.card) == "red";
      },
      content() {
        trigger.cancel();
      },
    },
    "tck_qi_xiao_tckland_skill": {
      init(player) {
        player.storage.tck_qi_xiao_tckland_skill = 0
      },
      marktext: "分",
      intro: {
        name: "操行分",
        content: "当前已扣#分"
      },
      forced: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        let card = event.card;
        return get.name(card) == "sha" ||
          get.subtype(card) == "equip1" ||
          get.name(card) == "tao" ||
          get.name(card) == "jiu"
      },
      async content(event, trigger, player) {
        let card = trigger.card
        if (get.name(card) == "sha") await player.addMark("tck_qi_xiao_tckland_skill", 5)
        else if (get.subtype(card) == "equip1") await player.addMark("tck_qi_xiao_tckland_skill", 10)
        else if (get.name(card) == "tao") await player.addMark("tck_qi_xiao_tckland_skill", 3)
        else if (get.name(card) == "jiu") await player.addMark("tck_qi_xiao_tckland_skill", 10)
        if (player.countMark("tck_qi_xiao_tckland_skill") >= 40) {
          await player.loseHp(player.hp)
        }
      }
    },
    "tck_mang_zhong_chu_cuo_skill": {
      forced: true,
      cardSkill: true,
      trigger: {
        player: ["gainAfter"],
        global: ["phaseBegin"],
      },
      filter(event, player) {
        let cards = player.getCards("h");
        return cards.some(card => get.name(card) == "tck_mang_zhong_chu_cuo")
      },
      async content(event, trigger, player) {
        let cards = player.getCards("h").filter(card => get.name(card) == "tck_mang_zhong_chu_cuo")
        await player.discard(cards)
        let discardNum = Math.floor(await player.countCards("h") / 2)
        let res = await player.chooseCard("h", true, discardNum).set('prompt', '请弃置一半的手牌').forResult()
        await player.discard(res.cards)
      }
    },
    "tck_gu_zhu_yi_zhi_skill": {
      cardSkill: true,
      mark: true,
      marktext: "孤",
      intro: {
        name: "孤注一掷",
        content: "回合结束进入濒死状态"
      },
      forced: true,
      trigger: {
        player: "phaseJieshu"
      },
      async content(event, trigger, player) {
        await player.loseHp(player.hp)
      }
    },
    "tck_gu_zhu_yi_zhi_lite_skill": {
      cardSkill: true,
      mark: true,
      marktext: "孤",
      intro: {
        name: "孤注一掷",
        content: "回合结束流失1点体力"
      },
      forced: true,
      trigger: {
        player: "phaseJieshu"
      },
      async content(event, trigger, player) {
        await player.loseHp(1)
      }
    },
    "tck_dong_xue_tckland_skill": {
      forced: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.name(event.card) == "wuxie" || get.name(event.card) == "wanjian";
      },
      async content(event, trigger, player) {
        trigger.targets.length = 0;
        trigger.all_excluded = true;
      }
    },
    "tck_scp_087_tckland_skill": {
      forced: true,
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      async content(event, trigger, player) {
        let res = await player.judge((card) => {
          if (get.name(card) == "tao" || get.name(card) == "taoyuan") return -1
          return 1
        }
        ).forResult();
        if (get.name(res) == "tao" || get.name(res) == "taoyuan") {
          await player.loseHp(player.hp)
        }
      },
      //不能对别人用牌
      mod: {
        playerEnabled(card, player, target) {
          if (player == target) {
            return true
          }
          return false
        },
      }
    },
    "tck_xue_zhan_dao_di_tckland_skill": {
      forced: true,
      //属性杀伤害+1
      trigger: {
        source: "damageBegin"
      },
      filter(event, player) {
        return get.name(event.card) == "sha" && game.hasNature(event.card)
      },
      async content(event, trigger, player) {
        trigger.num += 1
      },
      //多出1张杀
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return num + 1;
          }
        },
      }
    },
    "tck_wu_qie_skill_1": {
      equipSkill: true,
      enable: ["chooseToRespond", "chooseToUse"],
      filterCard(card, player) {
        return get.name(card) == "sha" && !game.hasNature(card);
      },
      position: "h",
      viewAs: {
        name: "sha",
        nature: "ice"
      },
      viewAsFilter(player) {
        if (!player.countCards("h", { name: "sha" })) {
          return false;
        }
      }
    },
    "tck_wu_qie_skill_2": {
      equipSkill: true,
      forced: true,
      trigger: {
        source: "damageBegin"
      },
      filter(event, trigger, player) {
        return event.nature == 'ice'
      },
      async content(event, trigger, player) {
        trigger.num += 1
      }
    },
    "tck_wu_qie_skill_3": {
      equipSkill: true,
      forced: true,
      trigger: {
        player: "damageBegin"
      },
      filter(event, trigger, player) {
        return event.nature == 'ice'
      },
      async content(event, trigger, player) {
        trigger.num = 0
      }
    },
    "tck_pi_skill": {
      forced: true,
      cardSkill: true,
      trigger: {
        player: ["gainEnd"],
        global: ["phaseBefore"],
      },
      filter(event, player) {
        let cards = player.getCards("h");
        return cards.some(card => get.name(card) == "tck_pi")
      },
      async content(event, trigger, player) {
        let pis = player.getCards("h").filter(card => get.name(card) == "tck_pi")
        await player.discard(pis)
      }
    },
    "tck_shi_skill": {
      forced: true,
      cardSkill: true,
      trigger: {
        player: ["gainEnd"],
        global: ["phaseBefore"],
      },
      filter(event, player) {
        if (player.hasSkill('tck_chi_ba_ba')) {
          return false
        }
        let cards = player.getCards("h");
        return cards.some(card => get.name(card) == "tck_shi")
      },
      async content(event, trigger, player) {
        let shis = player.getCards("h").filter(card => get.name(card) == "tck_shi")
        await player.discard(shis)
        if (player.name != "tch_hwj_wzh") {
          await player.loseHp(shis.length)
        }
      }
    },
    "tck_chun_ri_tian_lai_le_tckland_skill": {
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      filter(event, player) {
        return player.isDamaged()
      },
      async content(event, trigger, player) {
        await player.recover(1)
      }
    },
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill": {
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      async content(event, trigger, player) {
        let res = await player.judge((card) => {
          if (2 <= get.number(card) && get.number(card) <= 9) {
            if (get.suit(card) == 'diamond') return -1
            if (get.suit(card) == 'heart') return -2
            if (get.suit(card) == 'spade' || get.suit(card) == 'club') return 1
          }
          return 0
        }).forResult()
        if (2 <= get.number(res) && get.number(res) <= 9) {
          switch (get.suit(res)) {
            case 'diamond':
              let card = await player.chooseCard("he", true, 2).set('prompt', '请弃置2张牌').forResult()
              await player.discard(card.cards)
              break;
            case 'heart':
              await player.turnOver()
              break;
            case 'spade':
              await player.draw(2)
              break;
            case 'club':
              await player.recover(1)
              break;
          }
        }
      }
    },
    "tck_yue_mian_tckland_skill": {
      trigger: {
        player: "phaseJieshu"
      },
      forced: true,
      async content(event, trigger, player) {
        let cards = await player.getCards("e", (card) => {
          return get.name(card) == "tck_yu_hang_fu"
        })
        if (cards.length > 0) return  //如果是装备区内有宇航服，月面无效果
        await player.loseHp(1)
      }
    },
    "tck_scp_002_tckland_skill": {
      trigger: {
        player: "phaseZhunbeiBegin"
      },
      forced: true,
      async content(event, trigger, player) {
        await player.loseHp(1)
      }
    },
    "tck_sen_lin_tckland_skill": {
      forced: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.name(event.card) == "sha" && get.nature(event.card) == "fire"
      },
      async content(event, trigger, player) {
        await trigger.directHit.addArray(game.players);
      },
    },
    "tck_da_ri_zhao_tckland_skill": {
      trigger: {
        player: "damageBegin",
      },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == "sha" && (get.nature(event.card) == "fire" || get.nature(event.card) == "thunder");
      },
      async content(event, trigger, player) {
        if (get.nature(trigger.card) == "fire") trigger.num *= 2
        if (get.nature(trigger.card) == "thunder") trigger.num = 0
      }
    },
    "tck_mo_long_zhan_yue_skill_1": {
      equipSkill: true,
      enable: ["chooseToUse"],
      filterCard(card, player) {
        return get.color(card) == "black";
      },
      position: "h",
      viewAs: {
        name: "sha",
      },
      viewAsFilter(player) {
        if (!player.countCards("h", { color: "black" })) {
          return false;
        }
      },
      prompt: "将一张黑色手牌当杀使用",
    },
    "tck_mo_long_zhan_yue_skill_2": {
      equipSkill: true,
      //需（强制使用）
      forced: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.name(event.card) == "sha" && get.color(event.card) == "black"
      },
      async content(event, trigger, player) {
        await trigger.directHit.addArray(game.players);
      },
    },
    "tck_zuan_shi_jian_skill": {
      equipSkill: true,
      trigger: {
        source: "damageBegin1"
      },
      forced: true,
      filter(event, player) {
        return get.name(event.card) == "sha"
      },
      async content(event, trigger, player) {
        trigger.num++
      }
    },
    "tck_scp_127_skill": {
      equipSkill: true,
      mod: {
        cardUsable(card, player, num) {
          if (card.name == "sha") {
            return num + 2;
          }
        },
      },
      filter: (event, player) => {
        return player.getCardUsable({ name: "sha" }) > 0 && player.hasUseTarget({ name: 'sha' })
      },
      enable: "phaseUse",
      async content(event, trigger, player) {
        await player.loseHp(1)
        await player.chooseUseTarget(game.createCard({ name: 'sha' }), true);
      }
    },
    "tck_lei_yin_ce_dian_skill1": {
      equipSkill: true,
      forced: true,
      trigger: {
        player: "damageBegin",
      },
      filter(event, player) {
        return event.nature == "thunder"
      },
      async content(event, trigger, player) {
        trigger.num = 0
      }
    },
    "tck_lei_yin_ce_dian_skill2": {
      equipSkill: true,
      enable: ["chooseToUse", "chooseToRespond"],
      position: "he",
      viewAs: {
        name: "sha",
        nature: "thunder",
      },
      filterCard(card, player) {
        return get.name(card) != "tck_lei_yin_ce_dian";
      },
      viewAsFilter(player) {
        if (!player.countCards("he")) {
          return false;
        }
      },
      prompt: "任意一张牌当雷杀",
    },
    "tck_hu_tao_skill": {
      equipSkill: true,
      forced: true,
      trigger: {
        global: "recoverBegin"
      },
      filter(event, player) {
        return event.player != player
      },
      async content(event, trigger, player) {
        trigger.num = 0
      }
    },
    "tck_bai_niao_chao_feng_qiang_skill": {
      equipSkill: true,
      forced: true,
      trigger: {
        player: "useCard"
      },
      filter(event, player) {
        return get.type(event.card) == 'basic'
      },
      async content(event, trigger, player) {
        await player.draw(1)
      }
    },
  },
  translate: {
    "tck_xiang_jiao_pi_skill": "香蕉皮",
    "tck_xiang_jiao_pi": "香蕉皮",
    "tck_xiang_jiao_pi_info": "抽中本牌者弃置本牌并失去1点体力。",
    "tck_xiang_jiao": "香蕉",
    "tck_xiang_jiao_info": "同桃，使用后变成[香蕉皮]洗回牌堆。",
    "tck_duo": "躲",
    "tck_duo_info": "同闪，结算后摸一张牌。",
    "tck_ju": "橘",
    "tck_ju_info": "同桃，然后判定，若为♥，则受到1点火属性伤害。（上火）",
    "tck_li": "梨",
    "tck_li_info": "同桃，结算后摸一张牌。",
    "tck_suo_xie": "锁血",
    "tck_suo_xie_info": "扣至自身只剩1点体力，保持为1点体力，不会扣血。",
    "tck_suo_xie_skill": "锁血",
    "tck_gong_dian_chang": "供电场",
    "tck_gong_dian_chang_info": "场地效果：黑桃扣三<br/>红桃回二<br/>方块回一<br/>梅花濒死<br/>装备无效果",
    "tck_gong_dian_chang_tckland_skill": "供电场",
    "tck_gong_dian_chang_tckland_skill_info": "黑桃扣三<br/>红桃回二<br/>方块回一<br/>梅花濒死<br/>装备无效果",
    "tck_hu_fu": "虎符",
    "tck_hu_fu_info": "你的杀无数量限制。",
    "tck_hu_fu_skill": "虎符",
    "tck_wen_yi": "瘟疫",
    "tck_wen_yi_info": "放置任一角色判定区，若不为红桃，该玩家流失一点体力并将此牌放入下家判定区，若为红桃，弃置之。",
    "tck_tou_liang_huan_zhu": "偷梁换柱",
    "tck_tou_liang_huan_zhu_info": "摸2张牌后弃2张牌，若弃的2张均为基本牌，则你可以选择一名角色摸1弃1。",
    "tck_dou": "斗",
    "tck_dou_info": "选择一名角色猜拳，若你赢，其受到1点伤害，可被闪。",
    "tck_tong_ling_yi_shi": "通灵仪式",
    "tck_tong_ling_yi_shi_info": "损失1颗生命，可以从墓地（弃牌堆）自选2张牌使用。",
    "tck_gou_tong": "沟通",
    "tck_gou_tong_info": "场地效果：摸牌阶段无摸牌，牌堆里拿牌，至锦囊停，锦囊不获得。",
    "tck_gou_tong_tckland_skill": "沟通",
    "tck_gou_tong_tckland_skill_info": "摸牌阶段无摸牌，牌堆里拿牌，至锦囊停，锦囊不获得。",
    "tck_yu_qin_gu_zong": "欲擒故纵",
    "tck_yu_qin_gu_zong_info": "你令1名角色摸1张牌，然后其选择：①减1点体力；②给你2张牌。",
    "tck_land_yi_ji": "遗迹",
    "tck_land_yi_ji_info": "场地效果：双方回合开始时进行判定，若是黑桃则中机关，选择弃2张牌（至少1张）或扣1颗血。",
    "tck_land_yi_ji_tckland_skill": "遗迹",
    "tck_land_yi_ji_tckland_skill_info": "双方回合开始时进行判定，若是黑桃则中机关，选择弃2张牌（至少1张）或扣1颗血。",
    "tck_tan_nang_qu_wu": "探囊取物",
    "tck_tan_nang_qu_wu_info": "同顺手，无距离限制。",
    "tck_ba_la_la_mo_xian_bang": "巴啦啦魔仙棒",
    "tck_ba_la_la_mo_xian_bang_info": "给一名玩家下回合变身，红色为小魔仙，回合结束摸1张；黑色为黑魔仙，摸牌阶段额外摸一张。",
    "tck_hai_di": "海底",
    "tck_hai_di_info": "场地效果：无潜水服，每回合结束扣一滴，火杀无效，雷杀伤害+1。",
    "tck_hai_di_tckland_skill": "海底",
    "tck_hai_di_tckland_skill_1": "海底",
    "tck_hai_di_tckland_skill_2": "海底",
    "tck_hai_di_tckland_skill_info": "无潜水服，每回合结束扣一滴，火杀无效，雷杀伤害+1。",
    "tck_qian_shui_fu": "潜水服",
    "tck_qian_shui_fu_info": "不占用装备栏。",
    "tck_fan_hui": "反悔",
    "tck_fan_hui_info": "当你打错牌时，收回该牌。",
    "tck_lun_tai": "轮胎",
    "tck_lun_tai_info": "黑桃漏气少摸一张，梅花爆胎失去出牌阶段，方块摸个屁，红桃失去1点体力。",
    "tck_shen_wang_dun": "神王盾",
    "tck_shen_wang_dun_info": "红色的杀对你无效。",
    "tck_shen_wang_dun_skill": "神王盾",
    "tck_shen_wang_dun_skill_info": "红色的杀对你无效。",
    "tck_po_di_qian_qi": "破敌千骑",
    "tck_po_di_qian_qi_info": "弃置场上所有坐骑牌。",
    "tck_jin_gong_ma": "进攻马",
    "tck_jin_gong_ma_info": "锁定技，你计算与其他角色的距离-1。",
    "tck_fang_yu_ma": "防御马",
    "tck_fang_yu_ma_info": "锁定技，其他角色计算与你的距离+1。",
    "tck_po_fu_chen_zhou": "破釜沉舟",
    "tck_po_fu_chen_zhou_info": "你弃置一半的手牌（至少为1）（向下取整），然后弃置一人所有手牌。",
    "tck_wu_zhong_sheng_you_ex": "无中生有EX",
    "tck_wu_zhong_sheng_you_ex_info": "摸2张牌，若你手中有“无”，则你弃置之改为摸4张牌。",
    "tck_she_jin_qiu_yuan": "舍近求远",
    "tck_she_jin_qiu_yuan_info": "你可弃自己1张牌，然后获得一个人一张牌。",
    "tck_wu": "无",
    "tck_wu_info": "就是来卡你手的。",
    "tck_qi_xiao": "汽校",
    "tck_qi_xiao_info": "场地效果：<br/>装武器扣10分（危险）<br/>出杀扣5分（打架）<br/>出桃扣3分（外卖）<br/>喝酒扣10分（DDDD）<br/>扣满40分退学（濒死）",
    "tck_qi_xiao_tckland_skill": "汽校",
    "tck_qi_xiao_tckland_skill_info": "装武器扣10分（危险）<br/>出杀扣5分（打架）<br/>出桃扣3分（外卖）<br/>喝酒扣10分（DDDD）<br/>扣满40分退学（濒死）",
    "tck_mang_zhong_chu_cuo": "忙中出错",
    "tck_mang_zhong_chu_cuo_info": "摸到此牌立即弃置之，然后你弃置一半的手牌，向下取整。",
    "tck_shou_zha_hu_huan": "手札互换",
    "tck_shou_zha_hu_huan_info": "双方互换手卡。",
    "tck_gu_zhu_yi_zhi": "孤注一掷",
    "tck_gu_zhu_yi_zhi_info": "你摸10张牌，然后于回合结束进入濒死状态。",
    "tck_you_zhong_sheng_wu": "有中生无",
    "tck_you_zhong_sheng_wu_info": "对一人使用，其弃2张手牌。",
    "tck_dong_xue": "洞穴",
    "tck_dong_xue_info": "场地效果：无懈可击、万箭齐发无效。",
    "tck_dong_xue_tckland_skill": "洞穴",
    "tck_dong_xue_tckland_skill_info": "无懈可击、万箭齐发无效。",
    "tck_scp_087": "SCP-087 楼梯间",
    "tck_scp_087_info": "场地效果：牌不能指定其他玩家，回合开始判定，若为“桃”或“桃园结义”，则你进入濒死状态。",
    "tck_scp_087_tckland_skill": "SCP-087 楼梯间",
    "tck_scp_087_tckland_skill_info": "牌不能指定其他玩家，回合开始判定，若为“桃”或“桃园结义”，则你进入濒死状态。",
    "tck_xue_zhan_dao_di": "血战到底",
    "tck_xue_zhan_dao_di_info": "场地效果：每人多出一张杀，属性杀伤害+1。",
    "tck_xue_zhan_dao_di_tckland_skill": "血战到底",
    "tck_xue_zhan_dao_di_tckland_skill_info": "每人多出一张杀，属性杀伤害+1。",
    "land": "场地",
    "tck_fj": "特殊防具",
    "tck_ex": "额外装备",
    "tck_yu_hang_fu": "宇航服",
    "tck_yu_hang_fu_info": "不占防具位，在月面行动自如。",
    "tck_wu_qie": "雾切",
    "tck_wu_qie_info": "冰属性+1伤害，杀可以当冰杀，免对方冰属性。",
    "tck_wu_qie_skill_1": "雾切",
    "tck_wu_qie_skill_2": "雾切",
    "tck_wu_qie_skill_3": "雾切",
    "tck_wu_qie_skill_1_info": "杀可以当冰杀。",
    "tck_yi_dui_fang_yu_ma": "一对防御马",
    "tck_yi_dui_fang_yu_ma_info": "锁定技，其他角色计算与你的距离+2。",
    "tck_pi": "屁",
    "tck_pi_info": "摸个屁啊！摸到后弃置之。",
    "tck_shi": "屎",
    "tck_shi_info": "摸到此牌，立即弃置之并损失一点体力。",
    "tck_chun_ri_tian_lai_le": "春日天来了",
    "tck_chun_ri_tian_lai_le_info": "场地效果：回合开始体力血量+1。",
    "tck_chun_ri_tian_lai_le_tckland_skill": "春日天来了",
    "tck_chun_ri_tian_lai_le_tckland_skill_info": "回合开始体力血量+1。",
    "tck_liu_xing_yu_de_gong_yuan": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_info": "场地效果：黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill": "流星雨的公园",
    "tck_liu_xing_yu_de_gong_yuan_tckland_skill_info": "黑桃2~9摸2张，红桃2~9翻面，方块2~9弃2张，梅花2~9回复一点体力。",
    "tck_liu_xing_cha_hua": "流星茶花",
    "tck_liu_xing_cha_hua_info": "回复1点体力，回复1点体力上限，判红色再回1点体力。",
    "tck_huang_tian_dang_li": "黄天当立",
    "tck_huang_tian_dang_li_info": "你展示手牌，若没闪，则摸3张牌。",
    "tck_plus_four_hp": "\t",
    "tck_plus_four_hp_info": "+4上限，+4体力。",
    "tck_bu_tian_shi": "补天石",
    "tck_bu_tian_shi_info": "弃置所有手牌、装备，从牌堆中摸7张。",
    "tck_meng_hua": "梦话",
    "tck_meng_hua_info": "跳过我方这回合弃牌阶段。",
    "tck_yue_mian": "月面",
    "tck_yue_mian_info": "场地效果：没有氧气瓶，每回合结束扣1颗血。",
    "tck_yue_mian_tckland_skill": "月面",
    "tck_yue_mian_tckland_skill_info": "没有氧气瓶，每回合结束扣1颗血。",
    "tck_scp_002": "SCP-002",
    "tck_scp_002_info": "场地效果：回合开始流失一点体力。（不可被场地破坏）",
    "tck_scp_002_tckland_skill": "SCP-002",
    "tck_scp_002_tckland_skill_info": "回合开始流失一点体力。（不可被场地破坏）",
    "tck_sen_lin": "森林",
    "tck_sen_lin_info": "场地效果：火杀必定命中。",
    "tck_sen_lin_tckland_skill": "森林",
    "tck_sen_lin_tckland_skill_info": "火杀必定命中。",
    "tck_xian_zhen": "陷阵",
    "tck_xian_zhen_info": "你自弃1张牌，然后弃其他所有人1张牌。",
    "tck_hun_shui_mo_yu": "浑水摸鱼",
    "tck_hun_shui_mo_yu_info": "你获得1名角色2张牌，然后归还其1张牌。",
    "tck_shang_tang": "上膛",
    "tck_shang_tang_info": "双方把所有手牌丢弃，再从牌堆抽原数量的卡。",
    "tck_chang_di_po_huai": "场地破坏",
    "tck_chang_di_po_huai_info": "将场上场地破坏",
    "tck_da_ri_zhao": "大日照",
    "tck_da_ri_zhao_info": "场地效果：火杀伤害翻倍，雷杀无效。",
    "tck_da_ri_zhao_tckland_skill": "大日照",
    "tck_da_ri_zhao_tckland_skill_info": "火杀伤害翻倍，雷杀无效。",
    "tck_ku_rou_ji": "苦肉计",
    "tck_ku_rou_ji_info": "获得本回合自扣一点体力，得两张牌。（无限制）",
    "tck_ti_xing_chong_su": "体型重塑",
    "tck_ti_xing_chong_su_info": "使用后判定：<br/>①为红，+1体力上限；<br/>①为黑，-1体力上限。",
    "tck_xjx_de_zeng_li": "徐进雄的赠礼",
    "tck_xjx_de_zeng_li_info": "红桃摸2张，方块摸1张。",
    "TCK": "TCK",
    "tck_tou_xiang": "投降",
    "tck_tou_xiang_info": "出牌阶段使用，你死亡。",
    "tck_chang_qu_zhi_ru": "长驱直入",
    "tck_chang_qu_zhi_ru_info": "对一名角色造成一点伤害。",
    "tck_tian_jiang_de_bao_zha": "天降の宝札",
    "tck_tian_jiang_de_bao_zha_info": "双方将手牌补至6张。",
    "tck_mo_long_zhan_yue": "魔龙斩月",
    "tck_mo_long_zhan_yue_info": "你可将黑色手牌当杀使用，你的黑杀不可被闪避。",
    "tck_mo_long_zhan_yue_skill_1": "魔龙斩月",
    "tck_mo_long_zhan_yue_skill_1_info": "你可将黑色手牌当杀使用。",
    "tck_zuan_shi_jian": "钻石剑",
    "tck_zuan_shi_jian_info": "你的杀伤害+1。",
    "tck_zuan_shi_jian_skill": "钻石剑",
    "tck_zuan_shi_jian_skill_info": "你的杀伤害+1。",
    "tck_scp_127": "SCP127 活体枪",
    "tck_scp_127_info": "你可以额外使用2张杀，你可以自减1点体力，使用1张杀。",
    "tck_scp_127_skill": "SCP127 活体枪",
    "tck_scp_127_skill_info": "你可以自减1点体力，使用1张杀。",
    "tck_lei_yin_ce_dian": "雷印策电",
    "tck_lei_yin_ce_dian_info": "防止雷属性伤害，任意一张牌当雷杀。",
    "tck_lei_yin_ce_dian_skill1": "雷印策电",
    "tck_lei_yin_ce_dian_skill1_info": "防止雷属性伤害。",
    "tck_lei_yin_ce_dian_skill2": "雷印策电",
    "tck_lei_yin_ce_dian_skill2_info": "任意一张牌当雷杀。",
    "tck_hu_tao": "胡桃",
    "tck_hu_tao_info": "此马在场，除本人外其他人回复体力无效。",
    "tck_hu_tao_skill": "胡桃",
    "tck_hu_tao_skill_info": "此马在场，除本人外其他人回复体力无效。",
    "tck_bai_niao_chao_feng_qiang": "百鸟朝凤枪",
    "tck_bai_niao_chao_feng_qiang_info": "使用一张基本牌，获得一张牌。",
    "tck_bai_niao_chao_feng_qiang_skill": "百鸟朝凤枪",
    "tck_bai_niao_chao_feng_qiang_skill_info": "使用一张基本牌，获得一张牌。",
  },
  list: [
    //diy牌堆
    // ['club', 6, 'tck_duo'],
    // ['club', 6, 'tck_duo'],
    // ['diamond', 2, 'tck_duo'],
    // ['diamond', 7, 'tck_duo'],
    // ['diamond', 10, 'tck_duo'],
    // ['diamond', 11, 'tck_duo'],
    // ['diamond', 11, 'tck_duo'],
    // ['spade', 7, 'tck_duo'],

    ['spade', 5, 'tck_xiang_jiao'],
    ['heart', 6, 'tck_xiang_jiao'],
    ['diamond', 7, 'tck_ju'],
    ['diamond', 5, 'tck_ju'],
    ['diamond', 9, 'tck_ju'],
    ['heart', 3, 'tck_li'],
    ['club', 2, 'tck_li'],
    ['diamond', 1, 'tck_suo_xie'],
    ['club', 1, 'tck_gong_dian_chang'],
    ['heart', 12, 'tck_hu_fu'],
    ['spade', 8, 'tck_wen_yi'],
    ['club', 3, 'tck_tou_liang_huan_zhu'],
    ['diamond', 8, 'tck_dou'],
    ['spade', 2, 'tck_dou'],
    ['diamond', 11, 'tck_gou_tong'],
    ['spade', 4, 'tck_tong_ling_yi_shi'],
    ['heart', 3, 'tck_yu_qin_gu_zong'],
    ['heart', 1, 'tck_land_yi_ji'],
    ['heart', 8, 'tck_tan_nang_qu_wu'],
    ['heart', 4, 'tck_ba_la_la_mo_xian_bang'],
    ['diamond', 6, 'tck_hai_di'],
    ['diamond', 4, 'tck_qian_shui_fu'],
    ['diamond', 9, 'tck_fan_hui'],
    ['diamond', 7, 'tck_lun_tai'],
    ['heart', 2, 'tck_shen_wang_dun'],
    ['heart', 12, 'tck_po_di_qian_qi'],
    ['heart', 5, 'tck_jin_gong_ma'],
    ['heart', 13, 'tck_jin_gong_ma'],
    ['diamond', 5, 'tck_jin_gong_ma'],
    ['diamond', 13, 'tck_jin_gong_ma'],
    ['club', 13, 'tck_fang_yu_ma'],
    ['spade', 13, 'tck_fang_yu_ma'],
    ['spade', 5, 'tck_fang_yu_ma'],
    ['spade', 8, 'tck_po_fu_chen_zhou'],
    ['heart', 13, 'tck_wu_zhong_sheng_you_ex'],
    ['spade', 11, 'tck_she_jin_qiu_yuan'],
    ['club', 7, 'tck_wu'],
    ['spade', 11, 'tck_wu'],
    ['spade', 5, 'tck_qi_xiao'],
    ['spade', 8, 'tck_mang_zhong_chu_cuo'],
    ['spade', 4, 'tck_shou_zha_hu_huan'],
    ['heart', 1, 'tck_gu_zhu_yi_zhi'],
    ['spade', 1, 'tck_scp_087'],
    ['club', 11, 'tck_xue_zhan_dao_di'],
    ['spade', 6, 'tck_wu_qie'],
    ['heart', 5, 'tck_yi_dui_fang_yu_ma'],
    ['spade', 1, 'tck_pi'],
    ['diamond', 1, 'tck_pi'],
    ['club', 1, 'tck_pi'],
    ['spade', 13, 'tck_shi'],
    ['heart', 5, 'tck_chun_ri_tian_lai_le'],
    ['diamond', 4, 'sha', 'tck_lxy_gou'],
    ['spade', 13, 'tck_tou_xiang'],
    ['spade', 5, 'tck_chang_qu_zhi_ru'],
    ['diamond', 7, 'tck_tian_jiang_de_bao_zha'],
    ['spade', 12, 'tck_mo_long_zhan_yue'],
    ['heart', 2, 'tck_zuan_shi_jian'],
    ['club', 2, "tck_scp_127"],
    ['diamond', 6, "tck_lei_yin_ce_dian"],
    ['heart', 9, "tck_hu_tao"],
    ['spade', 6, "tck_hu_tao"],
    ['diamond', 10, "tck_bai_niao_chao_feng_qiang"],
    ['diamond', 10, "tck_xjx_de_zeng_li"],
    ['heart', 1, "tck_ti_xing_chong_su"],
    ['diamond', 11, "tck_ku_rou_ji"],
    ['heart', 8, "tck_da_ri_zhao"],
    ['heart', 13, "tck_chang_di_po_huai"],
    ['heart', 3, "tck_chang_di_po_huai"],
    ['diamond', 7, "tck_chang_di_po_huai"],
    ['spade', 5, "tck_chang_di_po_huai"],
    ['club', 7, "tck_shang_tang"],
    ['club', 8, "tck_hun_shui_mo_yu"],
    ['club', 2, "tck_xian_zhen"],
    ['club', 1, "tck_sen_lin"],
    ['diamond', 7, "tck_scp_002"],
    ['spade', 12, "tck_yue_mian"],
    ['spade', 9, "tck_meng_hua"],
    ['heart', 12, "tck_bu_tian_shi"],
    ['heart', 9, "tck_plus_four_hp"],
    ['spade', 6, "tck_huang_tian_dang_li"],
    ['heart', 4, "tck_liu_xing_cha_hua"],
    ['diamond', 7, "tck_liu_xing_yu_de_gong_yuan"],
    ['diamond', 4, "tck_yu_hang_fu"],
    ['spade', 7, "tck_yu_hang_fu"],
    ['spade', 7, "tck_dong_xue"],
    ['spade', 6, "tck_you_zhong_sheng_wu"],

    //原版牌堆
    ['spade', 11, 'wuxie'],
    ['spade', 11, 'wuxie'],
    ['spade', 1, 'wuxie'],
    ['spade', 12, 'wuxie'],
    ['spade', 12, 'wuxie'],
    ['spade', 11, 'wuxie'],
    ['spade', 10, 'wuxie'],
    ['club', 13, 'wuxie'],
    ['club', 12, 'wuxie'],
    ['club', 12, 'wuxie'],
    ['club', 12, 'wuxie'],
    ['diamond', 11, 'wuxie'],
    ['diamond', 13, 'wuxie'],
    ['diamond', 12, 'wuxie'],
    ['heart', 12, 'wuxie'],
    ['heart', 12, 'wuxie'],
    ['heart', 12, 'shan'],
    ['heart', 12, 'shan'],
    ['heart', 4, 'shan'],
    ['heart', 8, 'shan'],
    ['heart', 8, 'shan'],
    ['heart', 7, 'shan'],
    ['diamond', 13, 'shan'],
    ['diamond', 11, 'shan'],
    ['diamond', 11, 'shan'],
    ['diamond', 5, 'shan'],
    ['diamond', 4, 'shan'],
    ['diamond', 4, 'shan'],
    ['diamond', 3, 'shan'],
    ['diamond', 3, 'shan'],
    ['diamond', 10, 'shan'],
    ['diamond', 13, 'shan'],
    ['diamond', 13, 'shan'],
    ['diamond', 13, 'shan'],
    ['diamond', 13, 'shan'],
    ['diamond', 6, 'shan'],
    ['diamond', 6, 'shan'],
    ['diamond', 6, 'shan'],
    ['diamond', 10, 'shan'],
    ['diamond', 10, 'shan'],
    ['diamond', 1, 'shan'],
    ['diamond', 1, 'shan'],
    ['diamond', 8, 'shan'],
    ['diamond', 8, 'shan'],
    ['diamond', 8, 'shan'],
    ['diamond', 8, 'shan'],
    ['diamond', 8, 'shan'],
    ['diamond', 6, 'shan'],
    ['diamond', 7, 'shan'],
    ['diamond', 7, 'shan'],
    ['diamond', 7, 'shan'],
    ['diamond', 9, 'shan'],
    ['diamond', 2, 'shan'],
    ['diamond', 4, 'shan'],
    ['heart', 1, 'wanjian'],
    ['heart', 6, 'wuzhong'],
    ['heart', 8, 'wuzhong'],
    ['heart', 7, 'wuzhong'],
    ['diamond', 7, 'jiu'],
    ['spade', 8, 'jiu'],
    ['club', 9, 'jiu'],
    ['club', 6, 'jiu'],
    ['club', 3, 'jiu'],
    ['spade', 2, 'shunshou'],
    ['diamond', 7, 'shunshou'],
    ['diamond', 8, 'shunshou'],
    ['diamond', 9, 'shunshou'],
    ['club', 3, 'shunshou'],
    ['diamond', 11, 'nanman'],
    ['spade', 3, 'nanman'],
    ['club', 4, 'nanman'],
    ['spade', 2, 'sha'],
    ['spade', 3, 'sha'],
    ['spade', 5, 'sha'],
    ['spade', 10, 'sha'],
    ['spade', 11, 'sha'],
    ['diamond', 3, 'sha'],
    ['diamond', 10, 'sha'],
    ['diamond', 7, 'sha'],
    ['club', 4, 'sha'],
    ['club', 8, 'sha'],
    ['club', 7, 'sha'],
    ['club', 4, 'sha'],
    ['club', 3, 'sha'],
    ['club', 3, 'sha'],
    ['club', 10, 'sha'],
    ['club', 12, 'sha'],
    ['club', 6, 'sha'],
    ['club', 6, 'sha'],
    ['club', 6, 'sha', 'ice'],
    ['club', 5, 'sha', 'ice'],
    ['club', 5, 'sha', 'ice'],
    ['club', 7, 'sha', 'ice'],
    ['club', 3, 'sha', 'ice'],
    ['spade', 5, 'sha'],
    ['spade', 7, 'sha'],
    ['spade', 9, 'sha'],
    ['diamond', 6, 'sha'],
    ['heart', 8, 'sha'],
    ['heart', 8, 'sha'],
    ['heart', 10, 'sha'],
    ['heart', 11, 'sha'],
    ['diamond', 6, 'sha', 'fire'],
    ['diamond', 7, 'sha', 'fire'],
    ['heart', 6, 'sha', 'fire'],
    ['heart', 8, 'sha', 'fire'],
    ['heart', 11, 'sha', 'fire'],
    ['heart', 12, 'sha', 'fire'],
    ['heart', 13, 'sha', 'fire'],
    ['club', 12, 'sha', 'thunder'],
    ['club', 10, 'sha', 'thunder'],
    ['spade', 13, 'sha', 'thunder'],
    ['spade', 11, 'sha', 'thunder'],
    ['spade', 10, 'sha', 'thunder'],
    ['spade', 10, 'sha', 'thunder'],
    ['spade', 7, 'sha', 'thunder'],
    ['spade', 7, 'sha', 'thunder'],
    ['spade', 6, 'sha', 'thunder'],
    ['spade', 6, 'sha', 'thunder'],
    ['spade', 3, 'sha', 'thunder'],
    ['spade', 4, 'sha', 'thunder'],
    ['spade', 3, 'sha', 'thunder'],
    ['diamond', 3, 'sha', 'tck_light'],
    ['heart', 3, 'sha', 'tck_light'],
    ['diamond', 7, 'tao'],
    ['diamond', 6, 'tao'],
    ['heart', 2, 'tao'],
    ['heart', 5, 'tao'],
    ['heart', 6, 'tao'],
    ['heart', 7, 'tao'],
    ['heart', 8, 'tao'],
    ['heart', 10, 'tao'],
    ['heart', 10, 'tao'],
    ['heart', 11, 'tao'],
    ['heart', 11, 'guohe'],
    ['heart', 6, 'guohe'],
    ['club', 13, 'guohe'],
    ['diamond', 13, 'guohe'],
    ['spade', 1, 'shandian'],
    ['heart', 1, 'shandian'],
    ['club', 10, 'tiesuo'],
    ['club', 11, 'tiesuo'],
    ['heart', 7, 'lebu'],
    ['spade', 3, 'lebu'],
    ['spade', 12, 'zhangba'],
    ['spade', 7, 'bingliang'],
    ['spade', 7, 'chuqibuyi'],
    ['heart', 8, 'chuqibuyi'],
    ['diamond', 6, 'chuqibuyi'],
    ['club', 5, 'chuqibuyi'],
    ['diamond', 12, 'fangtian'],
    ['diamond', 3, 'wugu'],
    ['heart', 5, 'wugu'],
    ['heart', 1, 'wugu'],
    ['spade', 10, 'zhujinqiyuan'],
    ['club', 3, 'renwang'],
    ['spade', 2, 'bagua'],
    ['spade', 2, 'bagua'],
    ['spade', 5, 'zengbin'],
    ['club', 7, 'jiedao'],
    ['club', 6, 'jiedao'],
    ['heart', 10, 'huogong'],
    ['diamond', 10, 'huogong'],
    ['diamond', 7, 'huogong'],
    ['club', 2, 'tengjia'],
    ['spade', 2, 'tengjia'],
    ['club', 3, 'qinglong'],
    ['spade', 1, 'guging'],
    ['spade', 7, 'guanshi'],
    ['club', 1, 'muniu'],
    ['club', 12, 'lanyinjia'],
    ['heart', 5, 'zheji'],
    ['spade', 12, 'zhanxiang'],
    ['diamond', 8, 'qijia'],
    ['spade', 2, 'cixiong'],
    ['spade', 2, 'juedou'],
    ['club', 1, 'juedou'],
    ['club', 2, 'wufengjian'],
    ['spade', 2, 'hanbing'],
    ['diamond', 4, 'zhuque'],
    ['heart', 11, 'yiyi'],
    ['spade', 2, 'qinggang'],
    ['heart', 5, 'qilin'],
    ['diamond', 7, 'liulongcanjia'],
    ['heart', 1, 'zhuge'],
    ['diamond', 1, 'zhuge'],
    ['club', 6, 'yinfengjia'],
    ['heart', 11, 'yuanjiao'],
    ['club', 10, 'zhibi'],
    ['diamond', 7, 'shengdong'],
    ['club', 10, 'baiyin'],
    ['heart', 3, 'tuixinzhifu'],
    ['heart', 1, 'taoyuan'],
    ['spade', 10, 'yitianjian'],
    ['club', 13, 'suijiyingbian'],

    //TODO TCK_QI_XING_DAO
    ['diamond', 1, 'qixingbaodao'],
  ],
}

export default cards