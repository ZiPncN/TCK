import { lib, game, ui, get, ai, _status } from "../../noname.js";
import characters from "./js/character.js"
import skills from "./js/skill.js"
import cards from "./js/card.js"
import ex_cards from "./js/card_ex.js"
import groups from "./js/groups.js"
import natureConfig from "./js/natures.js"
export const type = "extension";
export default function () {
    return {
        name: "TCK",
        arenaReady: () => {
            // 把场地放到类似“仁库”的位置
            _status.tckLand = []
            if (lib.commonArea) {
                lib.commonArea.set("tckLand", {
                    translate: "场地牌",
                    areaStatusName: "tckLand",
                    toName: "toTckLand",
                    fromName: "fromTckLand",
                    async addHandeler(event, trigger, player) {
                        const { cards } = event
                        //在加入场地之前先把场地中的场地移至弃牌堆
                        let card = _status.tckLand[0]
                        if (card) {
                            game.log(card, "进入了弃牌堆")
                            await game.cardsDiscard(card).set("outRange", true).set("fromTckLand", true);
                        }
                        _status.tckLand.addArray(
                            cards.filter(function (card) {
                                return !card.willBeDestroyed("tckLand", null, event.relatedEvent);
                            })
                        )
                        game.broadcast(function (tckLand) {
                            _status.tckLand = tckLand
                        }, _status.tckLand)
                    },
                    async removeHandeler(event, trigger, player) {
                        const { cards } = event;
                        _status.tckLand.removeArray(cards)
                        game.broadcast(function (tckLand) {
                            _status.tckLand = tckLand
                        }, _status.tckLand)
                    }
                });
            }
        },
        /* 游戏数据加载后、界面加载前
         * config为本扩展选项、pack为本扩展包
         */
        content: (config, pack) => {
            //独立地图牌前提代码
            lib.element.player.changeTckLand = function (url) {
                var next = game.createEvent('changeTckLand');
                next.player = this;
                next.land = url;
                next.setContent(function () {
                    var land = event.land;
                    var name = land;
                    var skills = [];
                    //适配多效果的场地
                    skills.push(name + '_tckland_skill');
                    skills.push(name + '_tckland_skill_1');
                    skills.push(name + '_tckland_skill_2');
                    var skill = skills[0]
                    var node = ui.create.div('.background.upper.land');
                    node.destroy = function () {
                        //清空汽校的分值
                        let players = game.players
                        if (players) {
                            players.forEach(player => player.clearMark("tck_qi_xiao_tckland_skill"))
                        }
                        if (this.skill) {
                            //移除技能逻辑，下面的ui.skill只是作为展示
                            //适配多效果的场地
                            game.removeGlobalSkill(this.skill)
                            game.removeGlobalSkill(this.skill + "_1")
                            game.removeGlobalSkill(this.skill + "_2")
                            if (this.system) {
                                this.system.remove();
                            }
                        }
                        this.classList.add('hidden');
                        var node = this;
                        setTimeout(function () {
                            node.remove();
                        }, 3000);
                        if (ui.land == this) {
                            ui.land = null;
                        }
                    }
                    if (ui.land) {
                        document.body.insertBefore(node, ui.land);
                        if (ui.land.skill && ui.land.skill != skill) event.trigger('landDestroy');
                        ui.land.destroy();
                    }
                    else {
                        node.classList.add('hidden');
                        document.body.insertBefore(node, ui.window);
                        ui.refresh(node);
                        node.classList.remove('hidden');
                    }
                    ui.land = node;
                    if (name) {
                        node.name = name;
                        node.skill = skill;
                        if (player) {
                            node.source = player;
                            player.addTempSkill('land_used');
                        }
                        node.system = ui.create.system(lib.translate[skill], null, true, true);
                        lib.setPopped(node.system, function () {
                            var uiintro = ui.create.dialog('hidden');
                            var str = '地图';
                            if (node.source) {
                                str = '来源：' + get.translation(node.source);
                            }
                            var caption = uiintro.addText(str);
                            caption.style.margin = '0';
                            uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skill + '_info'] + '</div>');
                            uiintro.add(ui.create.div('.placeholder.slim'));
                            return uiintro;
                        }, 200);
                        //添加技能逻辑，上面的ui.skill只是作为展示
                        skills.forEach(skill => game.addGlobalSkill(skill))
                    }
                });
                return next;
            };
            //检测当前地图
            get.land = function (name) {
                if (name && typeof name === 'string') {
                    if (lib.skill.global.includes(name + '_tckland_skill')) {
                        return true;
                    }
                    if (lib.skill.global.includes(name + 'Land_skill')) {
                        return true;
                    }
                    return false;
                }
                for (var skill of lib.skill.global) {
                    if (skill.indexOf('Land_skill') != -1) {
                        return skill.slice(0, skill.length - 10);
                    }
                }

            };
            //切换bgm
            game.switchTCKBgm = function (name, ext) {
                if (_status.tckBgm && name == _status.tckBgm) return;
                _status.tckBgm = name;
                if (name && typeof name == "string") {
                    const audio = name.split(":");
                    let path = lib.assetURL + `extension/${ext ? ext + "/audio" : "TCK"}/bgm/` + `${audio[0]}.${audio[1] || "mp3"}`;
                    ui.backgroundMusic.src = path;

                    console.log(ui.backgroundMusic)

                    ui.backgroundMusic.addEventListener("ended", () => {
                        ui.backgroundMusic.src = path;
                    });
                }
                game.broadcast(function (name, ext) {
                    game.switchTCKBgm(name, ext);
                }, name, ext);
            };
            //不带弃牌堆的洗牌
            //cardArray ： 要一起洗进牌堆的牌（把牌放在数组尾部再洗牌）
            game.washCardNoWithDiscard = function (cardArray) {
                if (!ui.cardPile.hasChildNodes() && !ui.discardPile.hasChildNodes()) {
                    return false;
                }
                if (_status.maxShuffle != void 0) {
                    if (_status.maxShuffle == 0) {
                        if (_status.maxShuffleCheck) {
                            game.over(_status.maxShuffleCheck());
                        } else {
                            game.over("平局");
                        }
                        return [];
                    }
                    _status.maxShuffle--;
                }
                game.shuffleNumber++;
                const cards = Array.from(ui.cardPile.childNodes);
                if (_status.discarded) {
                    _status.discarded.length = 0;
                }
                if (cardArray) {
                    for (let i = 0; i < cardArray.length; i++) {
                        var currentcard = cardArray[i];
                        currentcard.vanishtag.length = 0;
                        currentcard.clearKnowers();
                        if (get.info(currentcard).vanish || currentcard.storage.vanish) {
                            currentcard.remove();
                            continue;
                        }
                        cards.push(currentcard);
                    }
                }
                cards.randomSort();
                return game.cardsGotoPile(cards, "triggeronly", "washCard", ["shuffleNumber", game.shuffleNumber]);
            }

            //是否开启牌堆
            if (lib.card?.list && lib.config.cards.some(cards => cards == 'TCK')) {
                lib.card.list.addArray(cards.list);
            }
            if (lib.card?.list && lib.config.cards.some(cards => cards == 'TCK_EX')) {
                lib.card.list.addArray(ex_cards.list);
            }

            natureConfig.resetLib()
        },
        precontent: () => {
            groups.forEach(g => game.addGroup(g.id, g.short, g.name, g.config))
            //添加武将和技能
            game.import('character', function () {
                return {
                    name: "TCK",
                    connect: true,
                    character: { ...characters.character },
                    characterSort: characters.characterSort,
                    characterTitle: { ...characters.characterTitle },
                    translate: { ...characters.translate, ...skills.translate },
                    skill: { ...skills.skill },
                }
            })

            //添加卡牌
            game.import('card', function () {
                return {
                    name: "TCK",
                    connect: true,
                    translate: { ...cards.translate },
                    card: { ...cards.card },
                    skill: { ...cards.skill },
                }
            })
            lib.config.all.cards.push('TCK');
            if (!lib.config.cards.includes('TCK')) lib.config.cards.remove('TCK');
            lib.translate['TCK'] = 'TCK';
            if (!lib.config.TCK) game.saveConfig('cards', lib.config.cards.concat('TCK')), game.saveConfig('TCK', true);

            game.import('card', function () {
                return {
                    name: "TCK_EX",
                    connect: true,
                    translate: { ...ex_cards.translate },
                    card: { ...ex_cards.card },
                    skill: { ...ex_cards.skill },
                }
            })
            lib.config.all.cards.push('TCK_EX');
            if (!lib.config.cards.includes('TCK_EX')) lib.config.cards.remove('TCK_EX');
            lib.translate['TCK_EX'] = 'TCK_EX';
            if (!lib.config.TCK_EX) game.saveConfig('cards', lib.config.cards.concat('TCK_EX')), game.saveConfig('TCK_EX', true);

            //添加自定义属性
            natureConfig.natures.forEach(n => game.addNature(n.id, n.name, n.config))
            natureConfig.skills()
            natureConfig.translates()
        },
        // 扩展帮助
        help: {},
        // 扩展选项
        config: {},
        package: {
            intro: "代码：ZPN",
            author: "TCK",
            diskURL: "",
            forumURL: "",
            version: "1.1",
        },
        files: {},
        connect: true
    }
};