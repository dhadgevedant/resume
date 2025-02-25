$(document).ready(function() {
    // Array to hold each container's scrolling data.
    var containerData = [];
    
    $('.container').each(function() {
      var container = $(this);
      
      // Duplicate text if the scrolling text is smaller than the window width.
      if (container.find('.scrolling-text').outerWidth() < $(window).width()) {
        var windowToScrolltextRatio = Math.round($(window).width() / container.find('.scrolling-text').outerWidth()),
            scrollTextContent = container.find('.scrolling-text .scrolling-text-content').text(),
            newScrollText = '';
        for (var i = 0; i < windowToScrolltextRatio; i++) {
          newScrollText += ' ' + scrollTextContent;
        }
        container.find('.scrolling-text .scrolling-text-content').text(newScrollText);
      }
      
      // Initialize variables for this container.
      var scrollingText = container.find('.scrolling-text'),
          scrollingTextWidth = scrollingText.outerWidth(),
          scrollingTextHeight = scrollingText.outerHeight(true),
          startLetterIndent = parseInt(scrollingText.find('.scrolling-text-content').css('font-size'), 10) / 4.8;
      startLetterIndent = Math.round(startLetterIndent);
      var scrollAmountBoundary = Math.abs($(window).width() - scrollingTextWidth),
          transformAmount = 0,
          leftBound = 0,
          rightBound = scrollAmountBoundary,
          transformDirection = container.hasClass('left-to-right') ? -1 : 1,
          transformSpeed = 100; // Base sensitivity.
      if (container.attr('speed')) {
        transformSpeed = parseInt(container.attr('speed'), 10);
      }
      // Adjust transformSpeed for mobile screens.
      if ($(window).width() < 640) {
        transformSpeed = transformSpeed * 0.6;
      }
      
      // Clone the scrolling text for infinite scrolling.
      container.append(scrollingText.clone().addClass('scrolling-text-copy'));
      container.find('.scrolling-text').css({ 'position': 'absolute', 'left': 0 });
      container.css('height', scrollingTextHeight);
      
      // Save the data for this container.
      containerData.push({
        container: container,
        scrollingText: scrollingText,
        scrollingTextWidth: scrollingTextWidth,
        scrollingTextHeight: scrollingTextHeight,
        startLetterIndent: startLetterIndent,
        scrollAmountBoundary: scrollAmountBoundary,
        transformAmount: transformAmount,
        leftBound: leftBound,
        rightBound: rightBound,
        transformDirection: transformDirection,
        transformSpeed: transformSpeed,
        getActiveScrollingText: function(direction) {
          var firstScrollingText = container.find('.scrolling-text:nth-child(1)');
          var secondScrollingText = container.find('.scrolling-text:nth-child(2)');
          var firstScrollingTextLeft = parseInt(firstScrollingText.css("left"), 10);
          var secondScrollingTextLeft = parseInt(secondScrollingText.css("left"), 10);
          if (direction === 'left') {
            return firstScrollingTextLeft < secondScrollingTextLeft ? secondScrollingText : firstScrollingText;
          } else if (direction === 'right') {
            return firstScrollingTextLeft > secondScrollingTextLeft ? secondScrollingText : firstScrollingText;
          }
        }
      });
    });
    
    // Function to update a container's scrolling based on a delta value.
    function handleScrollForContainer(data, delta) {
      if (delta > 0) {
        data.transformAmount += data.transformSpeed * data.transformDirection;
        data.container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(10deg)');
      } else {
        data.transformAmount -= data.transformSpeed * data.transformDirection;
        data.container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(-10deg)');
      }
      setTimeout(function() {
        data.container.find('.scrolling-text').css('transform', 'translate3d(' + data.transformAmount * -1 + 'px, 0, 0)');
      }, 10);
      setTimeout(function() {
        data.container.find('.scrolling-text .scrolling-text-content').css('transform', 'skewX(0)');
      }, 500);
      
      // Reset boundaries to enable infinite scrolling.
      if (data.transformAmount < data.leftBound) {
        var activeText = data.getActiveScrollingText('left');
        activeText.css({ 'left': Math.round(data.leftBound - data.scrollingTextWidth - data.startLetterIndent) + 'px' });
        data.leftBound = parseInt(activeText.css("left"), 10);
        data.rightBound = data.leftBound + data.scrollingTextWidth + data.scrollAmountBoundary + data.startLetterIndent;
      } else if (data.transformAmount > data.rightBound) {
        var activeText = data.getActiveScrollingText('right');
        activeText.css({ 'left': Math.round(data.rightBound + data.scrollingTextWidth - data.scrollAmountBoundary + data.startLetterIndent) + 'px' });
        data.rightBound += data.scrollingTextWidth + data.startLetterIndent;
        data.leftBound = data.rightBound - data.scrollingTextWidth - data.scrollAmountBoundary - data.startLetterIndent;
      }
    }
    
    // Global wheel event for desktop.
    $(window).on('wheel', function(e) {
      var delta = e.originalEvent.deltaY;
      containerData.forEach(function(data) {
        handleScrollForContainer(data, delta);
      });
    });
    
    // Global touch events for mobile.
    var lastTouchY = null;
    $(window).on('touchstart', function(e) {
      lastTouchY = e.originalEvent.touches[0].clientY;
    });
    $(window).on('touchmove', function(e) {
      if (lastTouchY === null) return;
      var currentY = e.originalEvent.touches[0].clientY;
      var delta = lastTouchY - currentY;
      containerData.forEach(function(data) {
        handleScrollForContainer(data, delta);
      });
      lastTouchY = currentY;
    });
  });

  // Reload the page automatically if the aspect ratio changes.
  (function() {
    var lastAspectRatio = window.innerWidth / window.innerHeight;
    window.addEventListener("resize", function() {
      var currentAspectRatio = window.innerWidth / window.innerHeight;
      // Use a tolerance to avoid frequent reloads on minor changes.
      if (Math.abs(currentAspectRatio - lastAspectRatio) > 0.01) {
        window.location.reload();
      }
    });
  })();