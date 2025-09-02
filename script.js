(() => {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const previewsTab = document.getElementById('previews');
  const normalTab = document.getElementById('rename'); // fixed ID to match HTML
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
    'zip': 'application/zip',
    'mkv': 'video/x-matroska',
  };

  const H_MAP = {
    'hng': 'png',
    'hpg': 'jpg',
    'hpeg': 'jpeg',
    'hif': 'gif',
    'hp4': 'mp4',
    'hp3': 'mp3',
    'hxt': 'txt',
    'h++': 'txt',
    'hpp': 'txt',
    'hip': 'zip',
    'hit': 'txt',
    'hkv': 'mkv',
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
        // show preview with original file
        showPreview(file);

        // list in rename with mapped extension
        const mappedExt = realExt(file.name);
        const newName = file.name.replace(/\.[^.]+$/, '.' + mappedExt);
        const renamedFile = new File([file], newName, {
          type: ALLOWED[mappedExt] || file.type
        });
        listNormal(renamedFile, newName);
      } else {
        // normal files go straight to rename
        listNormal(file, file.name);
      }
    });
  }

  function showPreview(file) {
    if (!previewsTab) return;

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
    } else if (mime === 'application/zip') {
      media = document.createElement('div');
      media.textContent = 'Reading ZIP...';

      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const zip = await JSZip.loadAsync(e.target.result);
          media.textContent = '';
          const list = document.createElement('ul');
          Object.keys(zip.files).forEach(name => {
            const li = document.createElement('li');
            const entry = zip.files[name];
            li.textContent = name + (entry.dir
              ? " (folder)"
              : " (" + humanSize(entry._data.uncompressedSize) + ")"
            );
            list.appendChild(li);
          });
          media.appendChild(list);
        } catch (err) {
          media.textContent = 'Error reading ZIP: ' + err.message;
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      media = document.createElement('div');
      media.textContent = 'Preview not supported (.' + ext + ')';
    }

    card.appendChild(media);

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

  function listNormal(file, suggestedName) {
    if (!normalTab) return;

    const card = document.createElement('article');
    card.className = 'card';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = file.name + ' (' + humanSize(file.size) + ')';
    card.appendChild(name);

    const renameBox = document.createElement('textarea');
    renameBox.className = 'rename';
    renameBox.value = suggestedName || file.name;
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

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
