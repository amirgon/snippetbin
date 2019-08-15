
function set_dirty(){
  document.querySelectorAll('.dirty_watcher').
    forEach(e => e.classList.add('dirty'));
}

function clear_dirty(){
  document.querySelectorAll('.dirty_watcher.dirty').
    forEach(e => e.classList.remove('dirty'));
}

var cache = {};
function cached_get(url){  
  if (url in cache) return Promise.resolve(cache[url]);
  else {
    return axios.get(url).then(res=>{
      cache[url] = res;
      return res;
    });
  }
}

function load_revision(revision, update_history){
  cached_get('/load_file/'+revision).then(res=>{
    current_revision = revision;
    editor_cmd++;
    editor.setValue(res.data.text); 
    if (update_history){
      let history = document.getElementById("history");
      revision_history = res.data.history;
      history.max = revision_history.length-1;
      history.value = 0;
    }
    let link = document.getElementById("link");
    let base_url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    link.value = base_url + "/?revision=" + revision;
    clear_dirty();
  }).catch(err=>{
    console.log('ERROR: ' + err.message);
  });
}

function save(){
  axios.post('/save_file', {
    "text": editor.getValue(),
    "original_revision": current_revision
  }).then(res=>{
    load_revision(res.data.revision, true);
  }).catch(err=>{
    console.log('ERROR: ' + err.message);
  });
}

function copy(){
  document.querySelectorAll('.copying_watcher').
    forEach(e => e.classList.add('copying'));

  let link = document.getElementById("link");
  link.select();
  document.execCommand("copy");
}

function copy_complete(){
  document.querySelectorAll('.copying_watcher').
    forEach(e => e.classList.remove('copying'));
}

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/python");
editor.on("input", function(e) {
  if (editor_cmd) editor_cmd--;
  else set_dirty();
});

var revision_history = []
var url_string = window.location.href;
var url = new URL(url_string);
var current_revision = url.searchParams.get("revision");
if (current_revision) load_revision(current_revision, true);

var editor_cmd=0;
