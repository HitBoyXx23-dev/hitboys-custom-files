(() => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewsTab = document.getElementById('previews');
  const normalTab = document.getElementById('normal');
  const tabs = document.querySelectorAll('.tab');

  const ALLOWED = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
    'txt': 'text/plain',
    'cpp': 'text/plain',
    'c++': 'text/plain',
  };

  const H_MAP = {
    'hng': 'png',
    'hpg': 'jpg',
    'hpeg': 'jpeg',
    'hif': 'gif',
    'hp4': 'mp4',
    'hp3': 'mp3',
    'hxt': 'txt',
    'h++': 'txt'  // NEW: support .h++ → treat as text/plain
    'hpp': 'txt'  // NEW: support .hpp → treat as text/plain
  };

  function getExt(name) {
    const m = name.toLowerCase().match(/\.([^.]+)$/);
    return m ? m[1] : '';
  }

  function isHExt(name) {
    return H_MAP.hasOwnProperty(getExt(name));
  }

  function realExt(name) {
    return H_MAP[getExt(name)] || getExt(name);
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (isHExt(file.name)) {
        showPreview(file);
      } else {
        listNormal(file);
      }
    });
  }

  function showPreview(file) {
    const ext = realExt(file.name);
    const mime = ALLOWED[ext] || '';
    const url = URL.createObjectURL(file);

    const card = document.createElement('article');
    card.className = 'card';
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name + ' (' + humanSize(file.size) + ')';
    card.appendChild(name);

    let media;
    if (mime.startsWith('image/')) {
      media = document.createElement('img');
      media.src = url;
      media.style.maxWidth = '200px';
    } else if (mime.startsWith('video/')) {
      media = document.createElement('video');
      media.src = url;
      media.controls = true;
      media.width = 200;
    } else if (mime.startsWith('audio/')) {
      media = document.createElement('audio');
      media.src = url;
      media.controls = true;
    } else if (mime === 'text/plain') {
      media = document.createElement('textarea');
      media.readOnly = true;
      media.style.width = '100%';
      media.style.height = '300px';
      const reader = new FileReader();
      reader.onload = e => media.value = e.target.result;
      reader.readAsText(file);
    } else {
      media = document.createElement('div');
      media.textContent = 'Preview not supported (.' + ext + ')';
    }

    card.appendChild(media);

    // Download button for previews
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.className = 'btn';
    downloadBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    card.appendChild(downloadBtn);

    previewsTab.prepend(card);
  }

  function listNormal(file) {
    const card = document.createElement('article');
    card.className = 'card';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name + ' (' + humanSize(file.size) + ')';
    card.appendChild(name);

    const renameBox = document.createElement('textarea');
    renameBox.className = 'rename';
    renameBox.value = file.name;
    card.appendChild(renameBox);

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.className = 'btn';
    downloadBtn.addEventListener('click', () => {
      const newName = renameBox.value.trim() || file.name;
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = newName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    card.appendChild(downloadBtn);

    normalTab.prepend(card);
  }

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Drag & drop
  ['dragenter','dragover'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave','drop'].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', e => {
    if (e.target.files.length) {
      handleFiles(e.target.files);
      fileInput.value = '';
    }
  });
})();
