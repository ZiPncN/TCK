import { lib, game, ui, get, ai, _status } from "../../../noname.js"
const simShaNatures = ['tck_light', 'tck_lxy_gou', 'tck_kan', 'tck_zhan']
const natureConfig = {
  shaNatures: [
    // 光杀
    [
      'tck_light',//添加的属性id
      '光',//添加的属性翻译
      {
        // audio: {
        //   'sha': {
        //     'jy_du': {
        //       'male': '../extension/金庸群侠传/peiyin/dusha_male.mp3',//男声音
        //       'female': '../extension/金庸群侠传/peiyin/dusha_female.mp3',
        //     },
        //   },
        //   'damage': {
        //     'jy_du': {
        //       '1': '../extension/金庸群侠传/peiyin/jy_du_damage.mp3',//1点伤害
        //       '2': '../extension/金庸群侠传/peiyin/jy_du_damage.mp3',//2点及以上伤害
        //     },
        //   },
        // },
        linked: true,//是否触发铁索
        // order: 40,//数值代表各元素在名称中排列的先后顺序
        background: "extension/TCK/imgs/cards/tck_light_sha.png",//这张属性杀的图片
        lineColor: [255, 239, 64],//使用属性杀指定目标的指示线颜色
        color: [255, 239, 64],//使用属性杀指定目标的指示线卡牌字体颜色
      },
    ],
    // 流星雨狗杀
    [
      'tck_lxy_gou',//添加的属性id
      '流星雨·狗',//添加的属性翻译
      {
        linked: true,//是否触发铁索
        background: "extension/TCK/imgs/cards/tck_lxy_gou_sha.png",//这张属性杀的图片
      }
    ],
    // 砍
    [
      'tck_kan',//添加的属性id
      '砍',//添加的属性翻译
      {
        linked: false,//是否触发铁索
        background: "extension/TCK/imgs/cards/tck_kan_sha.png",//这张属性杀的图片
      }
    ],
    // 斩
    [
      'tck_zhan',//添加的属性id
      '斩',//添加的属性翻译
      {
        linked: false,//是否触发铁索
        background: "extension/TCK/imgs/cards/sha_tck_zhan.png",//这张属性杀的图片
      }
    ],
  ],
  // 设置自定义属性的效果
  skills: function () {
    // ---------------------- 杀属性 begin -------------------------
    lib.skill['_tck_light_effect'] = {
      ruleSkill: true,
      logTarget: 'player',
      trigger: { source: 'damageBefore' },
      filter(event, player) {
        return event.hasNature('tck_light');
      },
      async content(event, trigger, player) {
        let res = await player.judge(function (card) {
          if (card.color == "red") {
            return 1;
          } else {
            return -1;
          }
        }).forResult();
        if (res.color == "red") trigger.num++
      }
    }
    lib.skill['_tck_lxy_gou_effect'] = {
      ruleSkill: true,
      logTarget: 'player',
      forced: true,
      trigger: { source: 'damageBefore' },
      filter(event, player) {
        return event.hasNature('tck_lxy_gou') && !player.hasSkill('gzbuqu');
      },
      async content(event, trigger, player) {
        await player.addSkill("gzbuqu")
      }
    }
    lib.skill['_tck_kan_effect'] = {
      ruleSkill: true,
      logTarget: 'player',
      forced: true,
      trigger: { source: 'damageBegin' },
      filter(event, player) {
        return event.hasNature('tck_kan')
      },
      async content(event, trigger, player) {
        const target = trigger.player
        let options = [
          ["extraDamage", `额外扣1滴血`],
        ]
        if (target.countCards("h") >= 2) {
          options.unshift(["discard2", `弃置两张牌`])
        }
        let result = await target
          .chooseButton([
            '砍',
            '请选择一项',
            [options, "textbutton"]
          ], true)
          .forResult();
        if (result.bool) {
          switch (result.links[0]) {
            case 'discard2':
              await target.chooseToDiscard(2, true, "he")
              break
            case 'extraDamage':
              trigger.num++
              break
          }
        }
        trigger.nature = undefined
      }
    }
    lib.skill['_tck_zhan_effect'] = {
      ruleSkill: true,
      logTarget: 'player',
      trigger: { source: 'damageBegin' },
      filter(event, player) {
        return event.hasNature('tck_zhan')
      },
      async content(event, trigger, player) {
        const res = await player.judge(card => {
          if (get.suit(card) == 'heart') return 1
          return -1
        }).forResult()
        if (get.suit(res) == 'heart') {
          trigger.num = 0
          await player.loseMaxHp(1)
        }
        trigger.nature = undefined
      }
    }
    // ----------------------- 杀属性 end --------------------------

    // ---------------------- 闪属性 begin -------------------------
    lib.skill['_tck_duo'] = {
      ruleSkill: true,
      logTarget: 'player',
      forced: true,
      popup: false,
      trigger: { player: ['useCard', 'respond'] },
      filter(event, player) {
        return get.nature(event.card) == 'tck_duo';
      },
      async content(event, trigger, player) {
        await player.draw(1)
      }
    }
    // ----------------------- 闪属性 end -------------------------- 

    // ---------------------- 酒属性 begin -------------------------
    lib.skill['_tck_test'] = {
      // log: false,
      // filterCard: function (card) {
      //   return get.suit(card) == 'club';
      // },
      // position: "hs",
      // viewAs: { name: "wuzhong" },
      // prompt: "将一张梅花手牌当无中生有使用",
      // check: function (card) { return 7 - get.value(card) },
    }
    // ----------------------- 酒属性 end -------------------------- 
  },
  // 配置自定义属性
  translates: function () {
    // ---------------------- 杀属性 begin -------------------------
    lib.translate['_tck_light_effect'] = '光属性伤害'
    lib.translate['_tck_light_effect_info'] = '造成伤害可进行一次判定，若为红色，此伤害+1'
    lib.translate['sha_nature_tck_light_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点光属性伤害。'
    lib.translate['tck_light_sha'] = '光杀'
    lib.translate['tck_light_sha_info'] = lib.translate['sha_nature_tck_light_info']
    lib.translate['tck_light_sha2'] = '光杀'
    lib.translate['_tck_lxy_gou_effect'] = '流星雨·狗'
    lib.translate['_tck_lxy_gou_effect_info'] = '此杀命中得不屈'
    lib.translate['sha_nature_tck_lxy_gou_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点流星雨·狗属性伤害，此杀命中得不屈。'
    lib.translate['tck_lxy_gou_sha'] = '流星雨·狗杀'
    lib.translate['tck_lxy_gou_sha_info'] = lib.translate['sha_nature_tck_lxy_gou_info']
    lib.translate['tck_lxy_gou_sha2'] = '流星雨·狗杀'
    lib.translate['_tck_kan_effect'] = '砍'
    lib.translate['_tck_kan_effect_info'] = '砍命中后让对手选择1项：<br/>①弃2张牌。<br/>②额外扣1滴血。';
    lib.translate['sha_nature_tck_kan_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点伤害，砍命中后让对手选择1项：①弃2张牌。②额外扣1滴血。';
    lib.translate['tck_kan_sha'] = '砍'
    lib.translate['tck_kan_sha_info'] = lib.translate['sha_nature_tck_kan_info']
    lib.translate['tck_kan_sha2'] = '砍'
    lib.translate['_tck_zhan_effect'] = '斩'
    lib.translate['_tck_zhan_effect_info'] = '同杀，命中后可选，判定，若为♥，则改为减1点体力上限。';
    lib.translate['sha_nature_tck_zhan_info'] = '出牌阶段，对你攻击范围内的一名角色使用。同杀，命中后可选，判定，若为♥，则改为减1点体力上限。';
    lib.translate['tck_zhan_sha'] = '斩'
    lib.translate['tck_zhan_sha_info'] = lib.translate['sha_nature_tck_zhan_info']
    lib.translate['tck_zhan_sha2'] = '斩'
    // ----------------------- 杀属性 end --------------------------

    // ---------------------- 闪属性 begin -------------------------
    lib.translate['tck_duo'] = '躲'
    lib.translate['tck_duo_shan_info'] = '同闪，结算后摸一张牌。'
    // ----------------------- 闪属性 end --------------------------  

    // ---------------------- 酒属性 begin -------------------------
    lib.translate['tck_test'] = '测试酒名称';
    lib.translate['tck_test_jiu_info'] = '测试酒描述';
    // ----------------------- 酒属性 end --------------------------
  },
  // 重设属性，参考金庸群侠传扩展的代码
  resetLib: function () {
    lib.tck_get_translation = get.translation
    get.translation = function (str, arg) {
      if (str && typeof str == 'object' && str.name) {
        if (arg == 'viewAs' && str.viewAs) {
          return lib.tck_get_translation.apply(this, arguments);
        }
        else if ((str.name == 'sha' || str.name == 'shan' || str.name == 'jiu') && str.nature) {
          if (str.name == 'sha' && simShaNatures.includes(str.nature)) {
            str.name = str.nature + '_sha2';
            var result = lib.tck_get_translation.apply(this, arguments);
            str.name = 'sha';
            return result;
          }
          else if (str.name == 'jiu' && lib.card.jiu.tck_nature.includes(str.nature)) {
            str.name = str.nature + '_jiu2';
            var result = lib.tck_get_translation.apply(this, arguments);
            str.name = 'jiu';
            return result;
          }
          else if (str.name == 'shan' && lib.card.shan.tck_nature.includes(str.nature)) {
            str.name = str.nature + '_shan2';
            var result = lib.tck_get_translation.apply(this, arguments);
            str.name = 'shan';
            return result;
          }
          else if (simShaNatures.includes(str.name) || lib.tck_nature_jiu.includes(str.name) || lib.tck_nature_shan.includes(str.name)) {
            var oldname = str.name;
            str.name = str.name + '2';
            var result = lib.tck_get_translation.apply(this, arguments);
            str.name = oldname;
            return result;
          };
        }
        else {
          return lib.tck_get_translation.apply(this, arguments);
        };
      };
      return lib.tck_get_translation.apply(this, arguments);
    }
    lib.tck_get_damageEffect = get.damageEffect
    get.damageEffect = function (target, player, viewer, nature) {
      if (nature && ((simShaNatures.includes(nature)))) {
        var name
        if (!player) {
          player = target
        }
        if (!viewer) {
          viewer = target
        }
        if (!!nature) {
          name = `${nature}damage`
        } else {
        }
        var eff = get.effect(target, { name: name }, player, viewer)
        if (eff > 0 && target.hujia > 0) return 0
        return eff
      } else {
        return lib.tck_get_damageEffect.apply(this, arguments)
      }
    }
    if (!lib.cardPack.TCK) {
      lib.cardPack.TCK = []
    }
    if (!lib.element.card.inits) lib.element.card.inits = []
    lib.element.card.setMark = function (skill, player) {
      var card = this;
      if (!card.addMark[skill]) card.addMark[skill] = [];
      card.addMark[skill].add(player);
      card.node.addMark.innerHTML = "";
      var str = [];
      for (var i in card.addMark) {
        str.push(get.translation(i));
      };
      if (str.length) card.node.addMark.innerHTML = str.join("<br>");
      return card;
    }
    lib.element.card.clearMark = function (skill, player, all) {
      var card = this;
      if (all) {
        card.addMark = {};
        card.node.addMark.innerHTML = "";
        return card;
      };
      if (card.addMark[skill]) {
        if (player === true) {
          delete card.addMark[skill];
        } else {
          card.addMark[skill].remove(player);
          if (!card.addMark[skill].length) delete card.addMark[skill];
        };
      };
      card.node.addMark.innerHTML = "";
      var str = [];
      for (var i in card.addMark) {
        str.push(get.translation(i));
      };
      if (str.length) card.node.addMark.innerHTML = str.join("<br>");
      return card;
    }
    lib.element.card.hasMark = function (skill, player) {
      var card = this;
      if (!card.addMark[skill]) return false;
      if (player === true) {
        return card.addMark[skill].length > 0;
      } else {
        if (card.addMark[skill].indexOf(player) == -1) return false;
      };
      return true;
    }
    var cardinit = function (card) {
      if (!card.node.addMark) {
        card.node.addMark = ui.create.div('.addMark', card);
      };
      if (!card.node.addMark.innerHTML) {
        card.node.addMark.innerHTML = "";
      };
      if (!card.addMark) {
        card.addMark = {};
      };
    }
    lib.element.card.inits.push(cardinit)


    // ---------------------- 杀属性 begin -------------------------
    let addNatureSha = function (nature, translation, config) {
      game.addNature(nature, translation, config);//本体添加属性杀的方法+
      lib.card[nature + 'damage'] = {
        ai: {
          result: {
            target: -1.5
          },
          tag: {
            damage: 1,
            natureDamage: 1,
          },
        },
      }
      lib.card[nature + 'damage']['ai']['tag'][nature + 'Damage'] = 1
      lib.translate[nature] = translation
      lib.cardPack.TCK.add(nature + '_sha')

      // lib.translate[nature + '_sha'] = translation + '杀'
      lib.card[nature + '_sha'] = {
        type: 'basic',
        naturex: nature,
        image: "ext:TCK/imgs/cards/" + nature + "_sha.png",
        // derivation: 'diy_card_tck_card_config',
        derivationpack: 'TCK',
        fullskin: true,
        //cardimage:'sha',
      }
    }
    this.shaNatures.filter(i => addNatureSha(...i))
    this.shaNatures.forEach(i => {
      lib.card.sha['ai']['tag'][`${i[0]}Damage`] = function (card, naturex) {
        if (game.hasNature(card, i[0])) return 1;
      }
    })
    // ----------------------- 杀属性 end --------------------------  

    // ---------------------- 闪属性 begin -------------------------
    lib.card.shan['tck_nature'] = ['tck_duo']
    lib.tck_nature_shan = ['tck_duo_shan']
    // 闪
    for (var i of lib.card.shan['tck_nature']) {
      lib.translate[i + "_shan"] = lib.translate[i];
      lib.translate[i + "_shan2"] = lib.translate[i];
      lib.card[i + "_shan"] = {
        naturex: i,
        type: 'basic',
        image: "ext:TCK/imgs/cards/" + i + "_shan.png",
        // derivation: 'diy_card_tck_card_config',
        derivationpack: 'TCK',
        fullskin: true,
        //cardimage:'sha',
      };
      if (!lib.natureAudio['shan']) lib.natureAudio['shan'] = {};
      // lib.natureAudio['shan'][i] = {
      //   'male': '../extension/TCK/audio/' + i + '_shan_male.mp3',//男声音 文件夹命名 例如   tck_taxue_shan_male.mp3
      //   'female': '../extension/TCK/audio/' + i + '_shan_female.mp3',
      // };
    }
    lib.card.shan.cardPrompt = function (card) {
      const cardNature = Array.isArray(card) ? card[3] : get.nature(card);
      if (!cardNature || typeof cardNature != "string") return lib.translate.shan_info;
      const info = lib.translate[cardNature + '_shan_info'];
      if (info && info.length) return info;
      return lib.translate.shan_info;
    }
    lib.cardPack.TCK.addArray(lib.tck_nature_shan)
    // ----------------------- 闪属性 end --------------------------  

    // ---------------------- 酒属性 begin -------------------------
    lib.card.jiu['tck_nature'] = []
    lib.tck_nature_jiu = []
    // 酒
    for (var i of lib.card.jiu['tck_nature']) {
      lib.translate[i + "_jiu"] = '酒';
      lib.translate[i + "_jiu2"] = '酒•' + lib.translate[i];
      lib.card[i + "_jiu"] = {
        naturex: i,
        type: 'basic',
        image: "ext:TCK/imgs/cards/" + i + "_jiu.png",
        // derivation: 'diy_card_jy_card_config',
        derivationpack: 'TCK',
        fullskin: true,
        //cardimage:'sha',
      };
      if (!lib.natureAudio['jiu']) lib.natureAudio['jiu'] = {};
      lib.natureAudio['jiu'][i] = {
        'male': '../extension/TCK/peiyin/' + i + '_jiu_male.mp3',//男声音 文件夹命名 例如   tck_wubao_jiu_male.mp3
        'female': '../extension/TCK/peiyin/' + i + '_jiu_female.mp3',
      };
      //lib.natureBg.set(i,"ext:TCK/image/equip/"+i+"_jiu.png");
    }
    lib.card.jiu.cardPrompt = function (card) {
      const cardNature = Array.isArray(card) ? card[3] : get.nature(card);
      if (!cardNature || typeof cardNature != "string") return lib.translate.jiu_info;
      const info = lib.translate[cardNature + '_jiu_info'];
      if (info && info.length) return info;
      return lib.translate.jiu_info;
    }
    lib.cardPack.TCK.addArray(lib.tck_nature_jiu)
    // ----------------------- 酒属性 end --------------------------




    lib.tck_card_init = lib.element.card.init
    lib.element.card.init = function (card) {
      if (Array.isArray(card)) {
        if (card[2] == 'sha' && (simShaNatures.includes(card[3]))) {
          if (!!card[3]) {
            card[2] = `${card[3]}_sha`
          }
          var cardx = lib.tck_card_init.call(this, card)
          card[2] = 'sha'
          cardx.name = 'sha'
          cardx.nature = card[3]
          cardx.classList.add(card[3])
          cardx.node.image.classList.add(card[3])
          return cardx
        }
        if (card[2] == 'shan' && card[3] && lib.card.shan.tck_nature.includes(card[3])) {
          card[2] = card[3] + '_shan'
          var cardx = lib.tck_card_init.call(this, card)
          card[2] = 'shan'
          cardx.name = 'shan'
          cardx.nature = card[3]
          cardx.classList.add(card[3])
          cardx.node.image.classList.add(card[3])
          return cardx
        }
        // else if (card[2] == 'jiu' && card[3] && lib.card.jiu.tck_nature.includes(card[3])) {
        //   card[2] = card[3] + '_jiu'
        //   var cardx = lib.tck_card_init.call(this, card)
        //   card[2] = 'jiu'
        //   cardx.name = 'jiu'
        //   cardx.nature = card[3]
        //   cardx.classList.add(card[3])
        //   cardx.node.image.classList.add(card[3])
        //   return cardx
        // }
        else if (lib.tck_nature_jiu.includes(card[2]) || lib.tck_nature_shan.includes(card[2])) {
          var nature = lib.card[card[2]].naturex
          card[3] = nature
          var cardx = lib.tck_card_init.call(this, card)
          cardx.nature = card[3]
          cardx.classList.add(card[3])
          cardx.node.image.classList.add(card[3])
          return cardx
        }
        else if (simShaNatures.includes(card[2].slice(0, -3))) {
          if (!!card[2]) {
            card[3] = card[2].slice(0, -3)
          } else {
          }
          var cardx = lib.tck_card_init.call(this, card)
          cardx.nature = card[3]
          cardx.classList.add(card[3])
          cardx.node.image.classList.add(card[3])
          return cardx
        }
      }
      var cardx = lib.tck_card_init.call(this, card)
      return cardx
    }





    // TODO 牌结算后的逻辑，暂时不用
    lib.skill['_tck_nature_use'] = {
      ai: {
        // skillTagFilter: function (player, tag, target) {
        //   const count = player.countCards('hs', function (card) {
        //     return get.name(card) == 'jiu' && get.nature(card) == 'jy_tusu';
        //   });
        //   if (count == 0) return false;
        //   return true
        // },
        // save: true,
      },
      mod: {
        cardSavable: function (card, player, target) {
          if (player["_tck_nature_use3"]) return;
          if (get.name(card) != 'jiu') return;
          // if (get.nature(card) != 'jy_tusu') return; // 排除使用的属性

          player["_tck_nature_use3"] = true;
          const mod = game.checkMod(card, player, target, 'unchanged', 'cardSavable', player);
          delete player["_tck_nature_use3"];
          if (mod !== false) return true;
        },
        aiOrder: function (player, card, num) {
          if (num <= 0) return num;
          if (typeof card == "object") {
            const cardName = get.name(card);
            const cardNature = get.nature(card);
            if (!cardNature || typeof cardNature != "string") return num;
            if (cardName != "shan" && cardName != "jiu") return num;
            return num + 0.1;
          };
        },
      },
      trigger: { player: ['useCardEnd', 'useCard', 'respondEnd'] },
      // 使用酒后的逻辑
      jiu: {
        // 'jy_tusu': function (event, player, card, targets, name) {
        //   if (name != 'useCardEnd') return;
        //   const trueTargets = event.targets.filter(i => !event.excluded.includes(i));
        //   for (const i of trueTargets) {
        //     if (!i.hasSkill('jy_tusu')) {
        //       i.addSkill('jy_tusu');
        //     };
        //   };
        // },
        // 'jy_wubao': function (event, player, card, targets, name) {
        //   if (name != 'useCard') return;
        //   let evt = event.getParent();
        //   if (evt.type == 'dying') {
        //     evt = evt.getParent('dying');
        //     if (evt && evt.source && evt.source != player) {
        //       evt.source.damage(player, 'jy_du');
        //       player.line(evt.source);
        //     };
        //   };
        // },
        // 'jy_lanlin': function (event, player, card, targets, name) {
        //   if (name != 'useCard') return;
        //   if (!event.baseDamage) event.baseDamage = 1;
        //   event.baseDamage += 1;
        // },
        // 'jy_zhuangyuan': function (event, player, card, targets, name) {
        //   if (name != 'useCardEnd') return;
        //   const count = player.countCards('h', { suit: 'heart' });
        //   if (!count) return false;
        //   const cards = get.randomCards(count, function (card) {
        //     return get.suit(card) == 'heart';
        //   });
        //   if (cards && cards.length) player.gain(cards, 'log', 'gain2');
        // },
        // 'jy_yuhu': function (event, player, card, targets, name) {
        //   if (name != 'useCard') return;
        //   const players = game.filterPlayer();
        //   for (const i of players) {
        //     const next = game.createEvent('jy_yuhu_use', false);
        //     next.setContent(function () {
        //       const bool1 = (!event.isHasJiu && player.hasSkill('jiu'));
        //       const bool2 = (!player.isDying() && event.isDying);
        //       if (trigger.all_excluded) return;
        //       const trueTargets = trigger.targets.filter(i => !trigger.excluded.includes(i));
        //       if (trueTargets.includes(player) && (bool1 || bool2)) {

        //         if (!player.countCards('hs', { suit: 'club' })) return;
        //         const next = player.chooseToUse();
        //         next.set('openskilldialog', '玉壶春:将一张梅花手牌当无中生有使用');
        //         next.set('norestore', true);
        //         next.set('_backupevent', 'jy_yuhu');
        //         next.set('custom', {
        //           add: {},
        //           replace: { window: function () { } }
        //         });
        //         next.backup('jy_yuhu');
        //       };
        //     });
        //     next.player = i;
        //     next._trigger = event;
        //     next.isHasJiu = i.hasSkill('jiu');
        //     next.isDying = function () {
        //       let evt = event.getParent();
        //       if (i.isDying()) return true;
        //       if (evt.type == 'dying') {
        //         evt = evt.getParent('dying');
        //         if (evt && evt.player && evt.player == i) {
        //           return true;
        //         };
        //       };
        //       return false;
        //     }();
        //     _status.event.next.remove(next);
        //     event.after.push(next);
        //   };
        // },
        natuers_jiu: [
          'tck_test_jiu',
        ],
        natuers: [
          'tck_test',
        ],
      },
      // 使用闪后的逻辑
      shan: {
        // 'jy_taxue': function (event, player, card, targets, name) {
        //   if (name != 'useCardEnd' && name != 'respondEnd') return;
        //   if (!event.respondTo) return;
        //   if (!player.hasSkill('jy_taxue')) {
        //     player.addTempSkill('jy_taxue', { player: 'phaseBegin' });
        //   };
        // },
        natuers_shan: [
          'tck_duo_shan',
        ],
        natuers: [
          'tck_duo',
        ],
      },
      forced: true,
      forced: true,
      lastDo: true,
      priority: -100,
      popup: false,
      content: function () {
        const evt = trigger;
        const respondTo = evt.respondTo;
        const cardName = evt.card.name;
        const cardNature = evt.card.nature;
        const triggerName = event.triggername;
        if (cardName != 'shan' && cardName != 'jiu') return;
        if (!cardNature) return;
        if (evt.name == 'useCard') {
          if (evt.all_excluded) return;
        };
        const info = lib.skill['_tck_nature_use'][cardName];
        if (info && info[cardNature]) info[cardNature](evt, player, evt.card, evt.targets, triggerName);
      },
    }

  }
}

export default natureConfig