import { lib, game, ui, get, ai, _status } from "../../../noname.js";
const natureConfig = {
  natures: [
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
    }
  ],
  // 设置自定义属性的效果
  skills: function () {
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
  },
  // 配置自定义属性
  translates: function () {
    lib.translate['_tck_light_effect'] = '光杀';
    lib.translate['_tck_lxy_gou_effect'] = '流星雨·狗杀';
    lib.translate['_tck_light_effect_info'] = '造成伤害可进行一次判定，若为红色，此伤害+1';
    lib.translate['_tck_lxy_gou_effect_info'] = '此杀命中得不屈';
    lib.translate['sha_nature_tck_light_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点光属性伤害。';
    lib.translate['sha_nature_tck_lxy_gou_info'] = '出牌阶段，对你攻击范围内的一名角色使用。其须使用一张【闪】，否则你对其造成1点流星雨·狗属性伤害，此杀命中得不屈。';
  }
}

export default natureConfig