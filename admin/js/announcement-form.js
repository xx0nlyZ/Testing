(function () {
    'use strict';

    var editId = null;

    var MOCK_DETAILS = {
        'ANN-1003': {
            subject: 'New Student Portal Features',
            summary: 'A new grade viewer and scheduling tool is rolling out this week.',
            status: 'Scheduled',
            audience: ['Students', 'Faculty'],
            releaseDate: '2024-05-24',
            releaseTime: '10:30 AM',
            content: '<p>The new <strong>grade viewer</strong> and scheduling tool rollout begins this week.</p>'
        },
        'ANN-1004': {
            subject: 'Faculty Development Workshop',
            summary: 'Sign up for the teaching strategies workshop on May 28, 2024.',
            status: 'Scheduled',
            audience: ['Faculty'],
            releaseDate: '2024-05-28',
            releaseTime: '02:00 PM',
            content: '<p>The <em>Teaching Strategies Workshop</em> will be held on <strong>May 28, 2024</strong>.</p>'
        }
    };

    function params() {
        return new URLSearchParams(window.location.search);
    }

    function showToast(message, type) {
        var toast = document.querySelector('#cec-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cec-toast';
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.className = 'toast show ' + (type ? 'toast-' + type : '');
        toast.innerHTML = '<i class="fa-solid ' + (type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info') + '" aria-hidden="true"></i>' + message;
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () {
            toast.className = 'toast';
        }, 2600);
    }

    function setAudience(selected) {
        var pills = document.querySelectorAll('.audience-pill');
        pills.forEach(function (pill) {
            var on = selected.indexOf(pill.getAttribute('data-audience')) !== -1;
            pill.classList.toggle('active', on);
            if (on) {
                pill.innerHTML = pill.getAttribute('data-audience') + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i>';
            } else {
                pill.textContent = pill.getAttribute('data-audience');
            }
        });
    }

    function selectedAudience() {
        return Array.prototype.map.call(document.querySelectorAll('.audience-pill.active'), function (pill) {
            return pill.getAttribute('data-audience');
        });
    }

    function switchMode(mode) {
        var controls = document.getElementById('schedule-controls');
        if (!controls) return;
        controls.classList.toggle('is-now', mode === 'now');
    }

    function loadEditMode() {
        var title = document.getElementById('page-title');
        var desc = document.getElementById('page-desc');
        var cardTitle = document.getElementById('card-title');
        var submitBtn = document.getElementById('submit-btn');
        var subject = document.getElementById('subject');
        var rteArea = document.getElementById('rte-area');

        var detail = MOCK_DETAILS[editId];
        if (title) title.textContent = 'Edit Announcement';
        if (desc) desc.textContent = 'Update the details of announcement ' + editId + '.';
        if (cardTitle) cardTitle.textContent = 'Edit Announcement Details';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Update Announcement';
        }

        if (!detail) return;

        if (subject) subject.value = detail.subject;
        if (rteArea) rteArea.innerHTML = detail.content;

        if (detail.releaseDate) {
            var dateInput = document.getElementById('release-date');
            if (dateInput) dateInput.value = detail.releaseDate;
            var html = document.querySelector('input[name="schedule"][value="date"]');
            if (html) html.checked = true;
            switchMode('date');
        }

        var time = document.getElementById('release-time');
        if (time && detail.releaseTime) {
            for (var i = 0; i < time.options.length; i++) {
                if (time.options[i].value === detail.releaseTime) {
                    time.selectedIndex = i;
                    break;
                }
            }
        }

        setAudience(detail.audience || []);
    }

    function execRte(cmd) {
        var area = document.getElementById('rte-area');
        if (!area) return;
        area.focus();
        if (cmd === 'insertImage') {
            var url = window.prompt('Paste an image URL:');
            if (url) document.execCommand('insertImage', false, url);
            return;
        }
        if (cmd === 'undo') {
            document.execCommand('undo');
            return;
        }
        if (cmd === 'redo') {
            document.execCommand('redo');
            return;
        }
        document.execCommand(cmd, false, null);
    }

    function bindRte() {
        document.querySelectorAll('[data-cmd]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                execRte(btn.getAttribute('data-cmd'));
            });
        });

        var color = document.getElementById('text-color');
        if (color) {
            color.addEventListener('input', function () {
                document.execCommand('foreColor', false, color.value);
            });
        }

        var area = document.getElementById('rte-area');
        if (area) {
            area.addEventListener('keyup', function () {
                var cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight', 'insertUnorderedList', 'insertOrderedList'];
                cmds.forEach(function (cmd) {
                    var btn = document.querySelector('[data-cmd="' + cmd + '"]');
                    if (!btn) return;
                    var active = false;
                    try {
                        active = document.queryCommandState(cmd);
                    } catch (e) {
                        active = false;
                    }
                    btn.classList.toggle('active', active);
                });
            });
        }
    }

    function bindUi() {
        document.querySelectorAll('input[name="schedule"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                switchMode(radio.value);
            });
        });

        document.getElementById('audience-list').addEventListener('click', function (e) {
            var pill = e.target.closest('.audience-pill');
            if (!pill) return;
            var value = pill.getAttribute('data-audience');
            var active = pill.classList.contains('active');
            if (active) {
                pill.classList.remove('active');
                pill.textContent = value;
            } else {
                var all = document.querySelector('.audience-pill[data-audience="All Users"]');
                if (value === 'All Users') {
                    document.querySelectorAll('.audience-pill').forEach(function (p) {
                        if (p !== all) {
                            p.classList.remove('active');
                            p.textContent = p.getAttribute('data-audience');
                        }
                    });
                    pill.classList.add('active');
                    pill.innerHTML = value + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i>';
                } else {
                    if (all && all.classList.contains('active')) {
                        all.classList.remove('active');
                        all.textContent = 'All Users';
                    }
                    pill.classList.add('active');
                    pill.innerHTML = value + ' <i class="fa-solid fa-xmark" aria-hidden="true"></i>';
                }
            }
        });

        var cancel = document.getElementById('cancel-btn');
        if (cancel) {
            cancel.addEventListener('click', function () {
                window.location.href = 'announcements.html';
            });
        }

        var submit = document.getElementById('submit-btn');
        if (submit) {
            submit.addEventListener('click', function () {
                var subject = document.getElementById('subject');
                var area = document.getElementById('rte-area');
                if (!subject.value.trim()) {
                    showToast('A subject is required.', 'error');
                    subject.focus();
                    return;
                }
                var audience = selectedAudience();
                if (!audience.length) {
                    showToast('Select at least one target audience.', 'error');
                    return;
                }
                submit.classList.add('btn-spin');
                var gist = editId ? updateAnnouncement : createAnnouncement;
                showToast(gist() + ' ...', '');
                setTimeout(function () {
                    submit.classList.remove('btn-spin');
                    showToast((editId ? 'Announcement updated' : 'Announcement posted') + (audience.indexOf('Students') !== -1 && area.innerHTML.indexOf('grade') !== -1 ? ' to ' + audience.join(', ') + '.' : ' successfully.'), 'success');
                    setTimeout(function () {
                        window.location.href = 'announcements.html';
                    }, 700);
                }, 900);
            });
        }
    }

    function createAnnouncement() {
        return 'Posting announcement';
    }

    function updateAnnouncement() {
        return 'Updating announcement ' + editId;
    }

    document.addEventListener('DOMContentLoaded', function () {
        editId = params().get('edit');
        bindRte();
        bindUi();
        if (editId) loadEditMode();
        else setAudience([]);
    });
})();