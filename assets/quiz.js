/* Interactive self-check engine for worksheets.
   - .opt buttons: data-correct="true" on the right option.
   - fill-in-blank: <input data-answer="4|four"> + a Check button.
   Live score counts each objective question solved correctly.
   Everything is hidden/flattened in print (see style.css @media print). */
(function () {
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var opts = Array.prototype.slice.call(document.querySelectorAll('.opt'));
    var fills = Array.prototype.slice.call(document.querySelectorAll('.fillrow'));
    var solvedSet = {};   // question id -> true once correct
    var scoreEl = document.getElementById('score');
    var totalQ = 0;

    // count distinct objective questions (each .opts group or .fillrow)
    var groups = {};
    document.querySelectorAll('.opts').forEach(function(g,i){ g.dataset.qid='o'+i; groups['o'+i]=true; });
    fills.forEach(function(f,i){ f.dataset.qid='f'+i; groups['f'+i]=true; });
    totalQ = Object.keys(groups).length;

    function refresh(){ if(scoreEl) scoreEl.textContent = Object.keys(solvedSet).length + ' / ' + totalQ; }
    refresh();

    // multiple choice / true-false / assertion
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('.opts');
        var fb = group.parentNode.querySelector('.feedback');
        var qid = group.dataset.qid;
        if (solvedSet[qid]) return;              // already solved
        if (btn.dataset.correct === 'true') {
          btn.classList.add('correct');
          group.querySelectorAll('.opt').forEach(function(b){ b.disabled = true; });
          solvedSet[qid] = true;
          if (fb){ fb.textContent = '✓ Correct!'; fb.className = 'feedback ok'; }
          refresh();
        } else {
          btn.classList.add('wrong'); btn.disabled = true;
          if (fb){ fb.textContent = '✗ Not quite — try another option.'; fb.className = 'feedback no'; }
        }
      });
    });

    // fill in the blank
    fills.forEach(function (row) {
      var input = row.querySelector('input');
      var btn = row.querySelector('button');
      var fb = row.parentNode.querySelector('.feedback');
      var qid = row.dataset.qid;
      var answers = (input.dataset.answer || '').toLowerCase().split('|').map(function(s){return s.trim();});
      function check(){
        if (solvedSet[qid]) return;
        var val = (input.value || '').trim().toLowerCase();
        if (val === '') return;
        if (answers.indexOf(val) !== -1) {
          solvedSet[qid] = true; input.disabled = true;
          input.style.borderColor = '#48d597';
          if (fb){ fb.textContent = '✓ Correct!'; fb.className = 'feedback ok'; }
          refresh();
        } else {
          if (fb){ fb.textContent = '✗ Try again.'; fb.className = 'feedback no'; }
        }
      }
      if (btn) btn.addEventListener('click', check);
      input.addEventListener('keydown', function(e){ if(e.key==='Enter') check(); });
    });

    // reset button
    var resetBtn = document.getElementById('resetQuiz');
    if (resetBtn) resetBtn.addEventListener('click', function(){
      solvedSet = {};
      opts.forEach(function(b){ b.classList.remove('correct','wrong'); b.disabled=false; });
      fills.forEach(function(f){ var i=f.querySelector('input'); i.disabled=false; i.value=''; i.style.borderColor=''; });
      document.querySelectorAll('.feedback').forEach(function(f){ f.textContent=''; f.className='feedback'; });
      refresh();
    });
  });
})();
