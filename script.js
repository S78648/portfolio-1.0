(function ($) {
  'use strict';

  // 1. Copy-to-clipboard micro-interaction
  function fallbackCopy(text, customMessage) {
    const $tempInput = $('<input>', {
      type: 'text',
      value: text
    }).css({
      position: 'fixed',
      top: '-9999px',
      left: '-9999px'
    });

    $('body').append($tempInput);
    $tempInput[0].select();

    try {
      document.execCommand('copy');
    } catch (err) {
      // Clipboard fallback failed silently
    }

    $tempInput.remove();
    showToast(customMessage || 'Copied to clipboard!');
  }

  function showToast(msg) {
    const $toast = $('#copy-toast');
    const $toastMsg = $('#copy-toast-msg');

    if ($toast.length && $toastMsg.length) {
      $toastMsg.text(msg);
      $toast.removeClass('opacity-0 translate-y-3').addClass('opacity-100 translate-y-0');

      setTimeout(function () {
        $toast.removeClass('opacity-100 translate-y-0').addClass('opacity-0 translate-y-3');
      }, 2500);
    }
  }

  window.copyToClipboard = function (text, customMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () {
          showToast(customMessage || 'Copied to clipboard!');
        })
        .catch(function () {
          fallbackCopy(text, customMessage);
        });
    } else {
      fallbackCopy(text, customMessage);
    }
  };

  // 2. Contact form dispatch via Formspree
  window.handleRpcSubmit = function (e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const $form = $('#rpc-dispatch-form');
    const $btn = $('#rpc-submit-btn');
    const $btnText = $('#rpc-btn-text');
    const $btnIcon = $('#rpc-btn-icon');
    const $consoleOutput = $('#rpc-console-output');

    if (!$form.length || !$btn.length || !$btnText.length) return;

    $btn.prop('disabled', true).addClass('opacity-80');
    $btnText.text('TRANSMITTING PACKET...');
    $btnIcon.text('sync').addClass('animate-spin');

    const startedAt = Date.now();

    $.ajax({
      url: $form.attr('action'),
      method: 'POST',
      data: $form.serialize(),
      dataType: 'json',
      headers: {
        Accept: 'application/json'
      }
    })
      .done(function () {
        $btnIcon.removeClass('animate-spin').text('verified');
        $btnText.text('HTTP 200 ACKNOWLEDGED');
        $btn.removeClass('bg-primary').addClass('bg-primary-container');
        $consoleOutput.removeClass('hidden').html(
          '<div class="flex items-center justify-between text-primary">' +
            '<span>RPC Status: 200 OK</span>' +
            '<span>Round-trip: ' + (Date.now() - startedAt) + 'ms</span>' +
          '</div>' +
          '<div class="text-on-surface-variant">// Packet dispatched to sirohisumit4@gmail.com via Formspree</div>'
        );
        showToast('RPC Packet successfully dispatched!');
        $form[0].reset();

        setTimeout(function () {
          $btn.prop('disabled', false).removeClass('opacity-80 bg-primary-container').addClass('bg-primary');
          $btnText.text('Dispatch RPC Packet');
          $btnIcon.text('send');
        }, 4000);
      })
      .fail(function (xhr) {
        const response = xhr.responseJSON || {};
        const message = response.error ||
          (response.errors && response.errors[0] && response.errors[0].message) ||
          'Transport failure. Please email sirohisumit4@gmail.com directly.';

        $btnIcon.removeClass('animate-spin').text('error');
        $btnText.text('RETRY DISPATCH');
        $btn.prop('disabled', false).removeClass('opacity-80');
        $consoleOutput.removeClass('hidden').html(
          '<div class="flex items-center justify-between text-error">' +
            '<span>RPC Status: ' + (xhr.status || 'ERR') + '</span>' +
            '<span>Round-trip: ' + (Date.now() - startedAt) + 'ms</span>' +
          '</div>' +
          '<div class="text-on-surface-variant">// ' + message + '</div>'
        );
        showToast('RPC dispatch failed. Please try again.');
      });

    return false;
  };

  // 3. Project Filter Tabs
  window.filterProjects = function (category) {
    const $projects = $('.project-item');
    const $btnAll = $('#btn-filter-all');
    const $btnDist = $('#btn-filter-distributed');
    const $btnEnt = $('#btn-filter-enterprise');
    const baseClass = 'px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all';

    $btnAll.add($btnDist).add($btnEnt).each(function () {
      $(this).attr('class', baseClass);
    });

    if (category === 'all' && $btnAll.length) {
      $btnAll.attr('class', 'px-3 py-1.5 rounded bg-primary text-on-primary font-semibold transition-all');
    } else if (category === 'distributed' && $btnDist.length) {
      $btnDist.attr('class', 'px-3 py-1.5 rounded bg-secondary text-on-secondary font-semibold transition-all');
    } else if (category === 'enterprise' && $btnEnt.length) {
      $btnEnt.attr('class', 'px-3 py-1.5 rounded bg-tertiary text-on-tertiary font-semibold transition-all');
    }

    $projects.each(function () {
      const $card = $(this);

      if (category === 'all') {
        $card.show();
      } else if (category === 'distributed') {
        $card.toggle($card.hasClass('project-distributed'));
      } else if (category === 'enterprise') {
        $card.toggle($card.hasClass('project-enterprise'));
      }
    });
  };

  // 4. Modal Drawer Inspector
  window.toggleModal = function (modalId) {
    const $modal = $('#' + modalId);

    if (!$modal.length) return;

    if ($modal.hasClass('hidden')) {
      $modal.removeClass('hidden').addClass('flex');
    } else {
      $modal.removeClass('flex').addClass('hidden');
    }
  };

  // 5. Live JVM Telemetry Jitter Simulation
  window.triggerMetricsInspector = function () {
    const $redis = $('#mesh-redis-latency');
    const $pool = $('#mesh-hikari-pool');
    const $p99 = $('#telemetry-p99');

    if ($redis.length) {
      $redis.text('Latency: ' + (1.0 + Math.random() * 0.5).toFixed(1) + 'ms');
    }

    if ($pool.length) {
      $pool.text('Pool: 20/20 active');
    }

    if ($p99.length) {
      $p99.text('Avg P99: ' + Math.floor(16 + Math.random() * 4) + 'ms');
    }

    showToast('JVM Hikari & Redis cluster telemetry synced: 0 latency jitter');
  };

  // 6. Metric Counter on Load
  $(function () {
    $('[data-counter-val]').each(function () {
      const $counter = $(this);
      const target = parseFloat($counter.attr('data-counter-val'));
      const prefix = $counter.attr('data-counter-prefix') || '';
      const suffix = $counter.attr('data-counter-suffix') || '';
      let current = 0;
      const step = target / 20;

      const interval = setInterval(function () {
        current += step;

        if (current >= target) {
          $counter.text(prefix + target + suffix);
          clearInterval(interval);
        } else {
          $counter.text(prefix + current.toFixed(1).replace('.0', '') + suffix);
        }
      }, 40);
    });

    // Close modal when clicking the backdrop
    $('[id^="modal-"]').on('click', function (e) {
      if (e.target === this) {
        $(this).removeClass('flex').addClass('hidden');
      }
    });

    // Close modal with Escape key
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') {
        $('[id^="modal-"]').removeClass('flex').addClass('hidden');
      }
    });
  });
})(jQuery);
