addListeners();

let heartBeatingAnimation;

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    let moveAndHideAnimation;

    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideAnimation = animaster().moveAndHide(block, 5000);
        });

    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 3000);
        });

    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingAnimation = animaster().heartBeating(block);
        });

    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }
        });
}

function animaster() {
    /**
     * Блок плавно появляется из прозрачного.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function fadeIn(element, duration) {
        element.style.transitionDuration =  `${duration}ms`;
        element.classList.remove('hide');
        element.classList.add('show');
    }

    /**
     * Функция, передвигающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param translation — объект с полями x и y, обозначающими смещение блока
     */
    function move(element, duration, translation) {
        element.style.transitionDuration = `${duration}ms`;
        element.style.transform = getTransform(translation, null);
    }

    /**
     * Функция, увеличивающая/уменьшающая элемент
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     * @param ratio — во сколько раз увеличить/уменьшить. Чтобы уменьшить, нужно передать значение меньше 1
     */
    function scale(element, duration, ratio) {
        element.style.transitionDuration =  `${duration}ms`;
        element.style.transform = getTransform(null, ratio);
    }

    function getTransform(translation, ratio) {
        const result = [];
        if (translation) {
            result.push(`translate(${translation.x}px,${translation.y}px)`);
        }
        if (ratio) {
            result.push(`scale(${ratio})`);
        }
        return result.join(' ');
    }

    /**
     * Блок плавно исчезает.
     * @param element — HTMLElement, который надо анимировать
     * @param duration — Продолжительность анимации в миллисекундах
     */
    function fadeOut(element, duration) {
        element.style.transitionDuration = `${duration}ms`;
        element.classList.remove('show');
        element.classList.add('hide');
    }

    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
        element.classList.add('show');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transform = null;
        element.style.transitionDuration = null;
    }

    return {
        _steps: [],

        addMove: function (duration, translation) {
            this._steps.push({name: 'move', duration: duration, params: translation});
            return this;
        },

        addScale: function (duration, ratio) {
            this._steps.push({name: 'scale', duration: duration, params: ratio});
            return this;
        },

        addFadeIn: function (duration) {
            this._steps.push({name: 'fadeIn', duration: duration});
            return this;
        },

        addFadeOut: function (duration) {
            this._steps.push({name: 'fadeOut', duration: duration});
            return this;
        },

        addDelay: function (duration) {
            this._steps.push({name: 'delay', duration: duration});
            return this;
        },

        play: function (element, cycled) {
            var timerIds = [];
            var intervalId = null;
            var steps = this._steps;

            function executeSteps() {
                var delay = 0;
                steps.forEach(function (step) {
                    var id = setTimeout(function () {
                        if (step.name === 'move') {
                            move(element, step.duration, step.params);
                        } else if (step.name === 'fadeIn') {
                            fadeIn(element, step.duration);
                        } else if (step.name === 'fadeOut') {
                            fadeOut(element, step.duration);
                        } else if (step.name === 'scale') {
                            scale(element, step.duration, step.params);
                        }
                    }, delay);
                    timerIds.push(id);
                    delay += step.duration;
                });
                return delay;
            }

            if (cycled) {
                var totalDuration = 0;
                steps.forEach(function (step) {
                    totalDuration += step.duration;
                });
                executeSteps();
                intervalId = setInterval(function () {
                    timerIds = [];
                    executeSteps();
                }, totalDuration);
            } else {
                executeSteps();
            }

            return {
                stop: function () {
                    timerIds.forEach(clearTimeout);
                    if (intervalId !== null) {
                        clearInterval(intervalId);
                    }
                },
                reset: function () {
                    this.stop();
                    steps.forEach(function (step) {
                        if (step.name === 'fadeIn') {
                            resetFadeIn(element);
                        } else if (step.name === 'fadeOut') {
                            resetFadeOut(element);
                        } else if (step.name === 'move' || step.name === 'scale') {
                            resetMoveAndScale(element);
                        }
                    });
                }
            };
        },

        move: function (element, duration, translation) {
            return this.addMove(duration, translation).play(element);
        },

        scale: function (element, duration, ratio) {
            return this.addScale(duration, ratio).play(element);
        },

        fadeIn: function (element, duration) {
            return this.addFadeIn(duration).play(element);
        },

        fadeOut: function (element, duration) {
            return this.addFadeOut(duration).play(element);
        },

        moveAndHide: function (element, duration) {
            var moveTime = duration * 2 / 5;
            var hideTime = duration * 3 / 5;
            return animaster()
                .addMove(moveTime, {x: 100, y: 20})
                .addFadeOut(hideTime)
                .play(element);
        },

        showAndHide: function (element, duration) {
            var stepTime = duration / 3;
            return animaster()
                .addFadeIn(stepTime)
                .addDelay(stepTime)
                .addFadeOut(stepTime)
                .play(element);
        },

        heartBeating: function (element) {
            return animaster()
                .addScale(500, 1.4)
                .addScale(500, 1)
                .play(element, true);
        },

        buildHandler: function () {
            var steps = this._steps;
            return function () {
                animaster()
                    .addSteps(steps)
                    .play(this);
            };
        },

        addSteps: function (steps) {
            this._steps = this._steps.concat(steps);
            return this;
        }
    };
}
