import { lib, game, ui, get, ai, _status } from "../../../noname.js";
const natureConfig = {
  natures: [
    // ---------------------- 杀属性 begin -------------------------
    // 光属性
    {
      id: "tck_light",
      name: "光",
      config: {
        color: '#ffea00',          //牌名的颜色
        linked: true,               //是否能被铁索连环传导
        lineColor: ['255', '239', '64'], //指引线颜色
        background: 'extension/TCK/imgs/cards/sha_tck_light.png', //设置卡图
      }
    },
    // 流星雨·狗属性
    {
      id: "tck_lxy_gou",
      name: "流星雨·狗",
      config: {
        linked: true,               //是否能被铁索连环传导
        background: 'extension/TCK/imgs/cards/sha_tck_lxy_gou.png', //设置卡图
      }
    },
    // ----------------------- 杀属性 end --------------------------
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
    // ----------------------- 杀属性 end --------------------------

    // ---------------------- 闪属性 begin -------------------------
    lib.skill['_tck_duo_effect'] = {
      ruleSkill: true,
      logTarget: 'player',
      forced: true,
      popup: false,
      trigger: { player: 'useCard' },
      filter(event, player) {
        return get.nature(event.card) == 'tck_duo';
      },
      async content(event, trigger, player) {
        await player.draw(1)
      }
    }
    // ----------------------- 闪属性 end --------------------------  
  },
  // 配置自定义属性
  translates: function () {
    // ---------------------- 杀属性 begin -------------------------
    lib.translate['_tck_light_effect'] = '光杀';
    lib.translate['_tck_light_effect_info'] = '造成伤害可进行一次判定，若为红色，此伤害+1';
    lib.translate['sha_nature_tck_light_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点光属性伤害。';
    lib.translate['_tck_lxy_gou_effect'] = '流星雨·狗杀';
    lib.translate['_tck_lxy_gou_effect_info'] = '此杀命中得不屈';
    lib.translate['sha_nature_tck_lxy_gou_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点流星雨·狗属性伤害，此杀命中得不屈。';
    // ----------------------- 杀属性 end --------------------------

    // ---------------------- 闪属性 begin -------------------------
    lib.translate['tck_duo'] = '躲';
    lib.translate['_tck_duo_effect'] = '躲';
    lib.translate['_tck_duo_effect_info'] = '同闪，结算后摸一张牌';
    lib.translate['tck_duo_shan_info'] = '同闪，结算后摸一张牌。';
    // ----------------------- 闪属性 end --------------------------  
  },
  resetLib: function () {
    if (!lib.element.card.inits) lib.element.card.inits = [];
    lib.tck_card_init = lib.element.card.init
    lib.element.card.init = function (card) {
      if (Array.isArray(card)) {
        if (card[2] == 'shan' && card[3] && lib.card.shan.tck_nature.includes(card[3])) {
          card[2] = card[3] + '_shan';
          var cardx = lib.tck_card_init.call(this, card);
          card[2] = 'shan';
          cardx.name = 'shan';
          cardx.nature = card[3];
          cardx.classList.add(card[3]);
          cardx.node.image.classList.add(card[3]);
          return cardx;
        }
        // else if (card[2] == 'jiu' && card[3] && lib.card.jiu.jy_nature.includes(card[3])) {
        //   card[2] = card[3] + '_jiu';
        //   var cardx = lib.jy_card_init.call(this, card);
        //   card[2] = 'jiu';
        //   cardx.name = 'jiu';
        //   cardx.nature = card[3];
        //   cardx.classList.add(card[3]);
        //   cardx.node.image.classList.add(card[3]);
        //   return cardx;
        // }
        // else if (lib.jy_nature_jiu.includes(card[2]) || lib.jy_nature_shan.includes(card[2])) {
        //   var nature = lib.card[card[2]].naturex;
        //   card[3] = nature;
        //   var cardx = lib.jy_card_init.call(this, card);
        //   cardx.nature = card[3];
        //   cardx.classList.add(card[3]);
        //   cardx.node.image.classList.add(card[3]);
        //   return cardx;
        // }
      };
      var cardx = lib.tck_card_init.call(this, card);
      return cardx;
    };

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
    };
    lib.element.card.inits.push(cardinit);
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
    };
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
    };
    lib.element.card.hasMark = function (skill, player) {
      var card = this;
      if (!card.addMark[skill]) return false;
      if (player === true) {
        return card.addMark[skill].length > 0;
      } else {
        if (card.addMark[skill].indexOf(player) == -1) return false;
      };
      return true;
    };

    lib.card.shan['tck_nature'] = [
      'tck_duo'
    ]
    lib.tck_nature_shan = [
      'tck_duo_shan',
    ]
    lib.cardPack.TCK.addArray(lib.tck_nature_shan)

    for (var i of lib.card.shan['tck_nature']) {
      lib.translate[i + "_shan"] = lib.translate[i];
      lib.translate[i + "_shan2"] = lib.translate[i];
      lib.card[i + "_shan"] = {
        naturex: i,
        type: 'basic',
        image: "ext:TCK/imgs/cards/" + "shan_" + i + ".png",
        // derivation: 'diy_card_tck_card_config',
        derivationpack: 'TCK',
        fullskin: true,
        //cardimage:'sha',
      };
      if (!lib.natureAudio['shan']) lib.natureAudio['shan'] = {};
      // lib.natureAudio['shan'][i] = {
      //   'male': '../extension/TCK/audio/' + i + '_shan_male.mp3',//男声音 文件夹命名 例如   jy_taxue_shan_male.mp3
      //   'female': '../extension/TCK/audio/' + i + '_shan_female.mp3',
      // };
    };
    lib.card.shan.cardPrompt = function (card) {
      const cardNature = Array.isArray(card) ? card[3] : get.nature(card);
      if (!cardNature || typeof cardNature != "string") return lib.translate.shan_info;
      const info = lib.translate[cardNature + '_shan_info'];
      if (info && info.length) return info;
      return lib.translate.shan_info;
    };
  }
}

export default natureConfig