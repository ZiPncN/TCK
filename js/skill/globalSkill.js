import { lib, game, get, _status, ui } from "../../../../noname.js";
export const globalSkills = [
  "tck_zhi_jie_sheng_li_effect",
  "tck_she_skill",
  "tck_fei_dao_skill",
  "tck_lxy_niu_skill",
]

const initGlobalSkills = () => {
  //============================================全局技能============================================
  /* // 添加语音
  "tck_send_skill_voice": {
    ruleSkill: true,
    charlotte: true,
    forced: true,
    locked: true,
    direct: true,
    silent: true,
    frequent: true,
    firstDo: true,
    popup: false,
    enable: "phaseUse",
    filter(event, player) {
      const skills = player.getSkills(false, false)
      if (skills.length == 0) return false
      let allVoiceList = []
      // 构建所有的技能：台词
      skills.forEach(skill => {
        const voiceMap = get.Audio.skill({ skill, player: player.name }).audioList
        allVoiceList.push(...voiceMap)
      })
      if (allVoiceList.length == 0) return false
      return true
    },
    async content(event, trigger, player) {
      const skills = player.getSkills(false, false)
      let allVoiceList = []
      // 构建所有的技能：台词
      skills.forEach(skill => {
        const voiceMap = get.Audio.skill({ skill, player: player.name }).audioList
        allVoiceList.push(...voiceMap)
      })
      if (allVoiceList.length == 0) return
      let options = allVoiceList.map(voice => voice.text)
      let result = await player.chooseButton(['选择一个语音播放', [options, "textbutton"]]).forResult()
      if (result.bool) {
        const skill = allVoiceList.find(voice => voice.text == result.links[0])
        if (skill.text) {
          await player.chat(skill.text)
          game.broadcastAll(file => game.playAudio(file), skill.file)
        }
      }
      player.markSkill(event.name)
    }
  }, */
  // 交换控制权（随从由玩家自己操作）
  lib.skill._tck_swap_control = {
    ruleSkill: true,    // 会自动注册为全局技能
    firstDo: true,
    trigger: {
      player: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseToCompareBegin", "chooseButtonBegin", "chooseCardBegin", "chooseTargetBegin", "chooseCardTargetBegin", "chooseControlBegin", "chooseBoolBegin", "choosePlayerCardBegin", "discardPlayerCardBegin", "gainPlayerCardBegin", "chooseToMoveBegin", "chooseToPlayBeatmapBegin", "chooseToGiveBegin", "chooseToGuanxingBegin", "chooseButtonTargetBegin", "chooseNumbersBegin"]
    },
    forced: true,
    priority: 100,
    forceDie: true,
    popup: false,
    filter: function (event, player) {
      if (event.autochoose && event.autochoose()) {
        return false;
      }
      if (lib.filter.tckWuxieSwap(event)) {
        return false;
      }
      if (_status.auto || !player.isTckUnderControl()) {
        return false;
      }
      return true;
    },
    async content(event, trigger, player) {
      game.swapPlayerAuto(player);
    }
  }
  lib.skill._tck_control_die = {
    ruleSkill: true,
    trigger: {
      player: "dieBegin"
    },
    lastDo: true,
    charlotte: true,
    forceDie: true,
    forced: true,
    silent: true,
    popup: false,
    filter(event, player) {
      return !!player._tckTrueMe && player != player._tckTrueMe[0]
    },
    async content(event, trigger, player) {
      player.removeSkill(event.name);
    },
    onremove(player) {
      var arr = player._tckTrueMe;
      delete player._tckTrueMe;          // 先清，避免重入

      if (!Array.isArray(arr)) return;   // 统一处理 undefined，后面不再判

      // 从其他角色的真身列表里移除 player
      for (const p of arr) {
        if (p === player) continue;
        if (!Array.isArray(p._tckTrueMe)) continue;   // p._tckTrueMe 可能 undefined，必要
        const index = p._tckTrueMe.indexOf(player);
        if (index !== -1) p._tckTrueMe.splice(index, 1);
      }

      if (player !== game.me || !arr.length) return;

      var master = arr[0];
      var target;

      if (!master.isDead()) {
        // 规则1：主人活着 → 选主人
        target = master;
      } else {
        // 规则2：主人死了 → 从其他人里随机挑一个活着的
        var alive = [];
        for (var i = 0; i < arr.length; i++) {
          var q = arr[i];
          if (q === player) continue;
          if (q.isDead()) continue;
          alive.push(q);
        }
        if (alive.length) {
          target = alive[Math.floor(Math.random() * alive.length)];
        } else {
          // 规则3：全都死了 → 仍然选主人
          target = master;
        }
      }

      if (!target || target === player) return;
      if (!game.notMe) {
        game.swapPlayerAuto(target);
      } else {
        delete game.notMe;
      }
      if (_status.auto) {
        ui.click.auto();
      }
    }
  }
  lib.skill._tck_effect_recovertrigger = {
    charlotte: true,
    ruleSkill: true,
    trigger: {
      player: 'phaseEnd',
      global: 'recoverEnd',
    },
    filter(event, player) {
      if (event.name === 'phase') return player.storage.jstxyishugaochao;
      if (_status.currentPhase === player) return true;
      return event.player != event.source && event.source == player;
    },
    silent: true,
    firstDo: true,
    forceDie: true,
    content() {
      if (trigger.name === 'phase') delete player.storage.jstxyishugaochao;
      else if (_status.currentPhase !== player) _status.event.trigger('xmiaoshou');
      else {
        if (player.storage.jstxyishugaochao == undefined) player.storage.jstxyishugaochao = trigger.num;
        else player.storage.jstxyishugaochao += trigger.num;
        if (player.storage.jstxyishugaochao >= 3) {
          player.storage.jstxyishugaochao -= 3;
          _status.event.trigger('xyishu');
        }
      }
    },
  }
  lib.skill._tck_effect_yishu = {
    charlotte: true,
    ruleSkill: true,
    trigger: { player: 'xyishu' },
    filter(event, player) {
      const config = lib.config.extension_TCK_voice_broadcast
      return config && config !== 'off';
    },
    silent: true,
    firstDo: true,
    forceDie: true,
    content() {
      const config = lib.config.extension_TCK_voice_broadcast
      trigger.player.$fullscreenpop('医术高超', 'water')
      game.broadcastAll(function (config) {
        if (config) game.playAudio('..', 'extension', 'TCK/audio/effect', 'tck_yishu')
      }, config)
    },
  }
  lib.skill._tck_effect_miaoshou = {
    charlotte: true,
    ruleSkill: true,
    trigger: { player: 'xmiaoshou' },
    filter(event, player) {
      const config = lib.config.extension_TCK_voice_broadcast
      return config && config !== 'off';
    },
    silent: true,
    firstDo: true,
    forceDie: true,
    content() {
      const config = lib.config.extension_TCK_voice_broadcast
      trigger.player.$fullscreenpop('妙手回春', 'water');
      game.broadcastAll(function (config) {
        if (config) game.playAudio('..', 'extension', 'TCK/audio/effect', 'tck_miaoshou');
      }, config);
    },
  }
  lib.skill._tck_effect_HighDamageAudio = {
    charlotte: true,
    ruleSkill: true,
    trigger: { source: 'damageBegin4' },
    filter(event, player) {
      const config = lib.config.extension_TCK_voice_broadcast
      return config && config !== 'off' && event.player != player && event.num >= 3;
    },
    silent: true,
    lastDo: true,
    priority: -Infinity,
    content() {
      const config = lib.config.extension_TCK_voice_broadcast
      if (trigger.num == 3) {
        player.$fullscreenpop('癫狂屠戮', 'fire');
        game.broadcastAll(function (config) {
          if (config) game.playAudio('..', 'extension', 'TCK/audio/effect', 'tck_diankuang')
        }, config)
      }
      else {
        player.$fullscreenpop('无双<br>万军取首', 'fire');
        game.broadcastAll(function (config) {
          if (config) game.playAudio('..', 'extension', 'TCK/audio/effect', 'tck_wanjun')
        }, config)
      }
    },
  }
  lib.skill._tck_effect_jishaAudio = {
    charlotte: true,
    ruleSkill: true,
    trigger: { source: 'dieBegin' },
    filter(event, player) {
      const config = lib.config.extension_TCK_voice_broadcast
      return config && config !== 'off' && event.player != player;
    },
    silent: true,
    firstDo: true,
    content() {
      'step 0'
      player.addMark('tck_kill', 1, false);
      'step 1'
      let config = lib.config.extension_TCK_voice_broadcast
      let list = ['一破·卧龙出山', '双连·一战成名', '三连·举世皆惊', '四连·天下无敌', '五连·诛天灭地', '六连·诛天灭地', '七连·诛天灭地']
      var num = Math.min(7, player.countMark('tck_kill'));
      player.$fullscreenpop(list[num - 1], ['water', 'wood', 'thunder', 'fire'][Math.min(3, num - 1)]);
      game.broadcastAll(function (num, config) {
        if (config) {
          game.playAudio('..', 'extension', 'TCK/audio/effect', 'tck_jisha' + num)
        }
      }, num, config);
    },
  }

}

export default initGlobalSkills