(function ($) {
    "use strict";
    $(window).bind("load", function () {
        $('#status').fadeOut();
        $('#preloader').delay(1000).fadeOut('slow')
    });
    $(window).ready(function () {
        if ($('.bg-image[data-bg-image]').length > 0) {
            $('.bg-image[data-bg-image]').each(function () {
                var el = $(this);
                var sz = getImgSize(el, el.attr("data-bg-image"));
                el.css('background-position', 'center').css('background-image', "url('" + el.attr("data-bg-image") + "')").css('background-size', 'cover').css('background-repeat', 'no-repeat')
            })
        }
        if ($('.bg-color[data-bg-color]').length > 0) {
            $('.bg-color[data-bg-color]').each(function () {
                var el = $(this);
                el.css('background-color', el.attr("data-bg-color"))
            })
        }


        if ($('.triangled').length > 0) {
            $('.triangled li').append('<div class="triangle"></div>')
        }
        $('.basket .close-btn').click(function () {
            $(this).parent().parent().fadeOut(function () {
                $(this).remove();
                checkBasketDropdown(!0)
            })
        });
        $('[data-hover="dropdown"]').dropdownHover();
        checkBasketDropdown();

        function checkBasketDropdown(remove) {
            if (remove) {
                var cn = parseInt($('.basket-item-count').text());
                var nn = cn - 1;
                $('.basket-item-count').text(nn)
            }
            if ($('.basket .basket-item').length <= 0) {
            }
        }

        $('.le-quantity a').click(function (e) {
            e.preventDefault();
            var currentQty = $(this).parent().parent().find('input').val();
            if ($(this).hasClass('minus') && currentQty > 0) {
                $(this).parent().parent().find('input').val(parseInt(currentQty) - 1)
            } else {
                if ($(this).hasClass('plus')) {
                    $(this).parent().parent().find('input').val(parseInt(currentQty) + 1)
                }
            }
        });
        if ($('.star').length > 0) {
            $('.star').raty({
                space: !1,
                starOff: 'images/star-off.png',
                starOn: 'images/star-on.png',
                score: function () {
                    return $(this).attr('data-score')
                }
            })
        }

        function getImgSize(el, imgSrc) {
            var newImg = new Image();
            newImg.onload = function () {
                var height = newImg.height;
                var width = newImg.width;
                el.css('height', height)
            };
            newImg.src = imgSrc
        }

        if ($("img.lazy").length > 0) {
            var allImgs = $("img.lazy").length;
            $("img.lazy").each(function (i) {
                var src = $(this).attr('src');
                $(this).attr('data-original', src);
                if (i + 1 >= allImgs) {
                    $("img.lazy").lazyload({
                        effect: "fadeIn"
                    })
                }
            })
        }
        $('img.svg').each(function () {
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
            jQuery.get(imgURL, function (data) {
                var $svg = jQuery(data).find('svg');
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID)
                }
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass + ' replaced-svg')
                }
                $svg = $svg.removeAttr('xmlns:a');
                $img.replaceWith($svg)
            }, 'xml')
        });
        if ($('.search-button').length > 0) {
            $('.search-button').click(function (e) {
                e.preventDefault();
                var fld = $(this).find('+ .field');
                fld.addClass('open')
            });
            $('html').click(function () {
                $('.search-holder .field').removeClass('open')
            });
            $('.search-holder').click(function (event) {
                event.stopPropagation()
            })
        }
        $('[data-placeholder]').focus(function () {
            var input = $(this);
            if (input.val() == input.attr('data-placeholder')) {
                input.val('')
            }
        }).blur(function () {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('data-placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('data-placeholder'))
            }
        }).blur();
        $('[data-placeholder]').parents('form').submit(function () {
            $(this).find('[data-placeholder]').each(function () {
                var input = $(this);
                if (input.val() == input.attr('data-placeholder')) {
                    input.val('')
                }
            })
        })
    });
    $('.goto-top').click(function (e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: 0
        }, 2000)
    });
    if ($('.selectpicker').length > 0) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            $('.selectpicker').selectpicker('mobile')
        } else {
            $('.selectpicker').selectpicker()
        }
    }
    $('select.nav').change(function () {
        var loc = ($(this).find('option:selected').val());
        scrollToSection(loc)
    });

    function scrollToSection(destSection) {
        location.href = destSection
    }
})(jQuery);
(function ($) {
    "use strict";
    var currentItemIndex;
    var time = 7;
    var $progressBar, $bar, $elem, isPause, tick, percentTime;

    function progressBar(elem) {
        $elem = elem;
        buildProgressBar();
        start()
    }

    function buildProgressBar() {
        $progressBar = $("<div>", {
            id: "progressBar"
        });
        $bar = $("<div>", {
            id: "bar"
        });
        $progressBar.append($bar).prependTo($elem)
    }

    function start() {
        percentTime = 0;
        isPause = !1;
        tick = setInterval(interval, 10)
    }
    function showCaption() {
        var currentSlide = $elem.find('.owl-item').eq(currentItemIndex);
        currentSlide.find('.caption').addClass('show')
    }

    function removeCaption() {
        var currentSlide = $elem.find('.owl-item').eq(currentItemIndex);
        currentSlide.find('.caption').removeClass('show')
    }

    function interval() {
        if (isPause === !1) {
            percentTime += 1 / time;
            $bar.css({
                width: percentTime + "%"
            });
            if (percentTime >= 100) {
                $elem.trigger('owl.next')
            }
        }
    }

    function pauseOnDragging() {
        isPause = !0
    }

    function moved() {
        currentItemIndex = this.owl.currentItem;
        clearTimeout(tick);
        start();
        showCaption()
    }

    if ($('.homeslider').length > 0) {
        $(".homeslider .owl-carousel").owlCarousel({
            slideSpeed: 500,
            paginationSpeed: 500,
            singleItem: !0,
            afterInit: progressBar,
            afterMove: moved,
            beforeMove: removeCaption,
            startDragging: pauseOnDragging
        })
    }
})(jQuery);
$(window).scroll(function (e) {
    var nav_anchor = $(".top-menu-holder");
    var gotop = $(document);
    if ($(this).scrollTop() >= 500) {
        $('.goto-top').css({
            'opacity': 1
        })
    } else if ($(this).scrollTop() < 500) {
        $('.goto-top').css({
            'opacity': 0
        })
    }
    if ($(this).scrollTop() >= $('header').height()) {
        nav_anchor.addClass('split')
    } else if ($(this).scrollTop() < $('header').height()) {
        nav_anchor.removeClass('split')
    }
});
