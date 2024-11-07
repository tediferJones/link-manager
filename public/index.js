// src/lib/getTag.ts
function getTag(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children.filter((child) => child !== undefined));
  return node;
}

// src/lib/security.ts
var bufferFrom = function(data, encoding) {
  if (encoding === "utf8") {
    const encoder = new TextEncoder;
    return encoder.encode(data);
  } else if (encoding === "base64") {
    const decodedString = atob(data);
    const bytes = new Uint8Array(decodedString.length);
    for (let i = 0;i < decodedString.length; i++) {
      bytes[i] = decodedString.charCodeAt(i);
    }
    return bytes;
  } else {
    throw new Error('Unsupported encoding type. Use "utf8" or "base64".');
  }
};
var bufferTo = function(buffer, encoding) {
  const bytes = new Uint8Array(buffer);
  if (encoding === "utf8") {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(bytes);
  } else if (encoding === "base64") {
    const binaryString = Array.from(bytes).map((byte) => String.fromCharCode(byte)).join("");
    return btoa(binaryString);
  } else {
    throw new Error('Unsupported encoding type. Use "utf8" or "base64".');
  }
};
async function getFullKey(password, salt) {
  return await crypto.subtle.deriveKey({
    name: "PBKDF2",
    salt: bufferFrom(salt, "base64"),
    iterations: 1e6,
    hash: "SHA-256"
  }, await crypto.subtle.importKey("raw", bufferFrom(password, "utf8"), "PBKDF2", false, ["deriveBits", "deriveKey"]), { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
async function encrypt(plainText, fullKey, iv) {
  return bufferTo(await crypto.subtle.encrypt({ name: "AES-GCM", iv: bufferFrom(iv, "base64") }, fullKey, bufferFrom(plainText, "utf8")), "base64");
}
async function decrypt(cipherText, fullKey, iv) {
  return bufferTo(await crypto.subtle.decrypt({ name: "AES-GCM", iv: bufferFrom(iv, "base64") }, fullKey, bufferFrom(cipherText, "base64")), "utf8");
}
function getRandBase64(type) {
  const length = {
    salt: 32,
    iv: 12
  }[type];
  return bufferTo(crypto.getRandomValues(new Uint8Array(length)).buffer, "base64");
}

// src/lib/utils.ts
function clearChildren(id) {
  const parent = document.querySelector(`#${id}`);
  if (!parent)
    throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild)
    parent.removeChild(parent.firstChild);
  return parent;
}
function isFolder(item) {
  return "contents" in item;
}

// src/components/dropdownContents.ts
function dropdownContents(vaultMan, folder, key, id) {
  return [
    getTag("button", {
      textContent: "Delete",
      className: "bg-red-500 flex-1 rounded-xl",
      onclick: () => {
        vaultMan.deleteItem(folder, key);
      }
    }),
    getTag("button", {
      textContent: "Rename",
      className: "bg-green-500 flex-1 rounded-xl",
      onclick: () => {
        const title = document.querySelector(`#title-${id}`);
        if (!title)
          throw Error("cant find title element");
        title.replaceWith(getTag("form", {
          className: "flex items-center gap-2 m-0",
          onsubmit: () => {
            const newKey = document.querySelector(`#rename-${id}`).value;
            vaultMan.renameItem(folder, key, newKey);
          }
        }, [
          getTag("input", {
            id: `rename-${id}`,
            className: "p-2 border-2 border-blue-600 rounded-xl w-full",
            value: key,
            required: true
          }),
          getTag("button", { type: "submit", textContent: "Rename", className: "p-2 bg-gray-300 rounded-xl flex justify-center items-center" })
        ]));
        document.querySelector(`#rename-${id}`).focus();
      }
    }),
    !folder.contents[key].contents ? undefined : getTag("button", {
      textContent: folder.contents[key].locked ? "New Pwd" : "Lock",
      className: "bg-orange-500 flex-1 rounded-xl",
      onclick: async () => {
        const dropdownContainer = clearChildren(`edit-${id}`);
        dropdownContainer.append(getTag("form", {
          className: "m-0 flex gap-2 w-full",
          onsubmit: async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const password = form.elements.namedItem("password").value;
            vaultMan.encryptFolder(folder.contents[key], password);
          }
        }, [
          getTag("input", {
            id: `encrypt-${id}`,
            name: "password",
            type: "password",
            required: true,
            placeholder: "Password",
            className: "p-2 border-2 border-blue-600 rounded-xl w-full"
          }),
          getTag("button", {
            type: "submit",
            textContent: "Encrypt",
            className: "p-2 rounded-xl bg-blue-600 text-white"
          })
        ]));
        document.querySelector(`#encrypt-${id}`).focus();
      }
    }),
    !folder.contents[key].url ? undefined : getTag("button", {
      textContent: "\u25B2",
      className: "text-xl min-h-4 text-white p-2 aspect-square bg-blue-600 rounded-full flex justify-center items-center",
      onclick: async () => {
        const item = folder.contents[key];
        await vaultMan.swapQueuePos(item, item.queuePos - 1);
        document.querySelector(`#settings-link-${item.queuePos}`).click();
      }
    }),
    !folder.contents[key].url ? undefined : getTag("button", {
      textContent: "\u25BC",
      className: "text-xl min-h-4 text-white p-2 aspect-square bg-blue-600 rounded-full flex justify-center items-center",
      onclick: async () => {
        const item = folder.contents[key];
        await vaultMan.swapQueuePos(item, item.queuePos + 1);
        document.querySelector(`#settings-link-${item.queuePos}`).click();
      }
    })
  ].filter((i) => i !== undefined);
}

// src/components/renderLink.ts
function renderLink(id, folder, key, vaultMan) {
  const item = folder.contents[key];
  if (isFolder(item))
    throw Error("this is a folder not a link");
  function timeStampToSeconds(timestamp) {
    return timestamp.split(":").reverse().reduce((total, part, i) => {
      if (i === 0)
        return Number(part);
      return total + Number(part) * 60 ** i;
    }, 0);
  }
  function getWatchPercent(record) {
    if (record.currentTime && record.totalTime) {
      console.log(timeStampToSeconds(record.currentTime) / timeStampToSeconds(record.totalTime));
      return timeStampToSeconds(record.currentTime) / timeStampToSeconds(record.totalTime) * 100;
    }
  }
  const watchBar = getTag("div", { className: "rounded-xl h-1 bg-red-500 w-[50%]" });
  watchBar.style.width = `${getWatchPercent(item) || 0}%`;
  return getTag("div", {
    id: `header-${id}`,
    className: `p-2 rounded-xl ${item.queuePos === folder.queueStart ? "bg-blue-300" : item.queuePos < folder.queueStart ? "bg-gray-200" : ""}`
  }, [
    getTag("div", { className: "flex justify-between items-center" }, [
      getTag("a", {
        id: `title-${id}`,
        className: "p-2 underline text-blue-600 truncate",
        textContent: `${item.queuePos + 1}.) ${key}`,
        href: item.url,
        target: "_blank",
        rel: "noopener noreferrer"
      }),
      getTag("button", {
        id: `settings-${id}`,
        textContent: "\u2630",
        className: "w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl",
        onclick: () => {
          const container = document.querySelector(`#edit-${id}`);
          if (!container)
            throw Error("cant find edit container");
          container.classList.toggle("p-2");
          document.querySelector(`#title-${id}`)?.classList.toggle("rounded-b-none");
          document.querySelector(`#header-${id}`).classList.toggle("bg-gray-300");
          if (container.hasChildNodes())
            return clearChildren(`edit-${id}`);
          container.append(getTag("div", { className: "w-full flex flex-col gap-2" }, [
            getTag("div", { className: "p-2 flex justify-around items-center border-2 border-gray-400 rounded-xl" }, [
              getTag("p", { textContent: `View count: ${item.viewCount}` }),
              getTag("p", { textContent: `Queue position: ${item.queuePos + 1}` }),
              getTag("p", { textContent: `${item.currentTime} / ${item.totalTime}` })
            ]),
            getTag("div", { className: "flex gap-2" }, dropdownContents(vaultMan, folder, key, id))
          ]));
        }
      })
    ]),
    watchBar,
    getTag("div", { id: `edit-${id}`, className: "flex gap-2 bg-gray-300 rounded-xl rounded-t-none" })
  ]);
}

// src/components/renderLockedFolder.ts
function renderLockedFolder(id, folder, key, vaultMan) {
  return getTag("div", {}, [
    getTag("div", {
      id: `header-${id}`,
      className: "p-2 flex justify-between items-center gap-2 rounded-xl",
      onclick: () => {
        document.querySelector(`#header-${id}`)?.classList.toggle("bg-orange-600");
        document.querySelector(`#header-${id}`)?.classList.toggle("rounded-b-none");
        const dropdown = document.querySelector(`#edit-${id}`);
        dropdown?.classList.toggle("p-2");
        if (!dropdown || dropdown.firstChild)
          return clearChildren(`edit-${id}`);
        dropdown.append(getTag("form", {
          className: "w-full m-0 flex gap-2",
          onsubmit: async (e) => {
            e.preventDefault();
            const errorContainer = document.querySelector(`#error-${id}`);
            if (!errorContainer)
              throw Error("Cant find error container");
            errorContainer.textContent = "";
            errorContainer.classList.remove("p-2");
            const form = e.currentTarget;
            const password = form.elements.namedItem(`decrypt-${id}`).value;
            const error = await vaultMan.decryptFolder(folder.contents[key], password);
            console.log(error);
            if (error) {
              errorContainer.textContent = error;
              errorContainer.classList.add("p-2");
            }
          }
        }, [
          getTag("input", {
            id: `decrypt-${id}`,
            type: "password",
            placeholder: "Password",
            required: true,
            className: "p-2 rounded-xl w-full"
          }),
          getTag("button", {
            textContent: "Decrypt",
            type: "submit",
            className: "p-2 rounded-xl bg-orange-600 hover:text-white transition-all"
          })
        ]), getTag("p", { id: `error-${id}`, className: "text-center text-red-500 pb-0 font-bold text-lg" }));
        document.querySelector(`#decrypt-${id}`).focus();
      }
    }, [
      getTag("div", {
        id: `title-${id}`,
        textContent: `${key}`,
        className: "flex-1 rounded-xl p-2 hover:bg-orange-600 hover:text-white transition-all folder"
      }),
      getTag("button", {
        textContent: "\uD83D\uDD12",
        className: "border-2 border-orange-600 rounded-xl p-2 w-8 h-8 flex justify-center items-center"
      })
    ]),
    getTag("div", { id: `edit-${id}`, className: "bg-gray-300 rounded-b-xl" })
  ]);
}

// src/components/renderFolder.ts
function renderFolder(id, folder, key, vaultMan) {
  const item = folder.contents[key];
  if (!isFolder(item))
    throw Error("this is not a folder");
  let hidden = false;
  return getTag("div", {}, [
    getTag("div", { id: `header-${id}`, className: "p-2 flex justify-between items-center gap-2 rounded-t-xl transition-all duration-1000" }, [
      getTag("div", {
        id: `title-${id}`,
        textContent: `${key} (${Object.keys(folder.contents[key].contents).length})`,
        className: "flex-1 rounded-xl p-2 folder hover:bg-blue-600 hover:text-white transition-all",
        onclick: () => {
          vaultMan.currentLocation = item;
          vaultMan.render();
        }
      }),
      item.locked ? getTag("p", { textContent: "\uD83D\uDD13" }) : undefined,
      getTag("button", {
        id: `settings-${id}`,
        textContent: "\u2630",
        className: "w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl",
        onclick: () => {
          document.querySelector(`#header-${id}`).classList.toggle("bg-blue-600");
          document.querySelector(`#title-${id}`).classList.toggle("text-white");
          document.querySelector(`#settings-${id}`).classList.toggle("text-white");
          const settingsContainer = clearChildren(`edit-${id}`);
          settingsContainer.classList.toggle("p-2");
          hidden = !hidden;
          if (!hidden)
            return;
          settingsContainer.append(...dropdownContents(vaultMan, folder, key, id));
        }
      })
    ]),
    getTag("div", { id: `edit-${id}`, className: "flex gap-2 bg-gray-300 rounded-b-xl" })
  ]);
}

// src/components/queueController.ts
function queueController(vaultMan) {
  chrome.storage.local.get("playlist").then(({ playlist }) => {
    const btn = document.querySelector("#primaryAction");
    if (playlist) {
      btn.textContent = "\u23F9";
      btn.onclick = () => {
        chrome.storage.local.remove("playlist");
        vaultMan.render();
      };
    } else {
      btn.textContent = "\u25B6";
      btn.onclick = () => {
        vaultMan.setPlaylist(vaultMan.currentLocation);
        vaultMan.render();
      };
    }
  });
  return getTag("div", { className: "flex justify-center gap-4 text-2xl" }, [
    getTag("button", { textContent: "\u23EA" }),
    getTag("button", {
      id: "primaryAction"
    }),
    getTag("button", { textContent: "\u23E9" }),
    getTag("button", {
      textContent: "\uD83D\uDD04",
      onclick: () => {
        vaultMan.currentLocation.queueStart = 0;
        vaultMan.saveAndRender();
      }
    })
  ]);
}

// src/lib/VaultManager.ts
class VaultManager {
  vault;
  currentLocation;
  constructor(vault) {
    this.vault = vault;
    this.currentLocation = vault;
    this.buildTree(vault);
  }
  render() {
    const queueContainer = clearChildren("queueController");
    if (this.currentLocation.sortedKeys.links.length > 0) {
      queueContainer.append(queueController(this));
    }
    document.querySelector("#folderTitle").textContent = this.currentLocation.title || "Home";
    clearChildren("directoryContainer").append(...this.getVaultList());
  }
  async saveAndRender() {
    await chrome.storage.local.set({ vault: await this.reduceVault() });
    this.render();
  }
  addLink({ title, url }) {
    this.currentLocation.contents[title] = {
      url,
      viewed: false,
      viewCount: 0,
      queuePos: this.currentLocation.sortedKeys.links.length
    };
    this.setSortedKeys();
    this.saveAndRender();
  }
  addFolder({ title }) {
    this.currentLocation.contents[title] = {
      contents: {},
      parent: this.currentLocation,
      title,
      sortedKeys: {
        folders: [],
        links: []
      },
      queueStart: 0
    };
    this.setSortedKeys();
    this.saveAndRender();
  }
  deleteItem(folder, key) {
    delete folder.contents[key];
    this.setSortedKeys();
    this.saveAndRender();
  }
  renameItem(folder, key, newKey) {
    if (!newKey)
      return "cannot find new name";
    if (newKey === key)
      return;
    if (folder.contents[newKey])
      return "name is already taken";
    folder.contents[newKey] = folder.contents[key];
    delete folder.contents[key];
    console.log("after delete", this.currentLocation);
    this.setSortedKeys();
    this.saveAndRender();
  }
  async encryptFolder(folder, password) {
    const salt = getRandBase64("salt");
    const iv = getRandBase64("iv");
    const fullKey = await getFullKey(password, salt);
    const encrypted = await encrypt(JSON.stringify(folder.contents), fullKey, iv);
    console.log("raw content", JSON.stringify(folder.contents));
    console.log("encrypted", encrypted);
    console.log("password", password);
    folder.locked = {
      data: encrypted,
      iv,
      salt,
      fullKey
    };
    this.saveAndRender();
  }
  async decryptFolder(folder, password) {
    console.log(folder);
    if (!folder.locked)
      throw Error("this folder is not locked");
    const { data, iv, salt } = folder.locked;
    const fullKey = await getFullKey(password, salt);
    let decrypted;
    try {
      decrypted = await decrypt(data, fullKey, iv);
      console.log("decrypted data", decrypted);
    } catch {
      return "Wrong Password";
    }
    folder.contents = JSON.parse(decrypted);
    folder.locked.fullKey = fullKey;
    this.currentLocation = folder;
    this.buildTree();
    this.render();
  }
  async reduceVault(vault = this.vault) {
    const newVault = {
      contents: {},
      sortedKeys: vault.sortedKeys,
      queueStart: vault.queueStart
    };
    return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault2 = await newVaultPromise;
      if (vault.contents[key].contents) {
        const result = await this.reduceVault(vault.contents[key]);
        const locked = vault.contents[key].locked;
        if (locked) {
          if (locked?.fullKey) {
            locked.data = await encrypt(JSON.stringify(result.contents), locked.fullKey, locked.iv);
          }
          newVault2.contents[key] = { locked };
        } else {
          newVault2.contents[key] = { contents: result.contents, sortedKeys: result.sortedKeys };
        }
      } else {
        newVault2.contents[key] = vault.contents[key];
      }
      return newVault2;
    }, Promise.resolve(newVault));
  }
  buildTree(folder = this.vault) {
    return Object.keys(folder.contents).forEach((key) => {
      if (isFolder(folder.contents[key])) {
        folder.contents[key].parent = folder;
        folder.contents[key].title = key;
        this.buildTree(folder.contents[key]);
      }
    });
  }
  setSortedKeys(folder = this.currentLocation) {
    const folders = [];
    const links = [];
    Object.keys(folder.contents).forEach((key) => {
      const item = folder.contents[key];
      if (item.locked || isFolder(item)) {
        folders.push(key);
      } else {
        links.push(key);
      }
    });
    folders.sort();
    links.sort((a, b) => folder.contents[a].queuePos - folder.contents[b].queuePos);
    folder.sortedKeys = { folders, links };
  }
  getVaultList(folder = this.currentLocation) {
    if (!Object.keys(folder.contents).length) {
      return [getTag("div", {
        textContent: "No contents found",
        className: "p-4 text-center text-xl font-bold text-gray-500"
      })];
    }
    return folder.sortedKeys.folders.concat(folder.sortedKeys.links).map((key, i) => {
      return folder.contents[key].url ? renderLink(`link-${folder.contents[key].queuePos}`, folder, key, this) : folder.contents[key].contents ? renderFolder(`folder-${i}`, folder, key, this) : renderLockedFolder(`folder-${i}`, folder, key, this);
    });
  }
  async swapQueuePos(record, newPos) {
    const sortedLinkKeys = this.currentLocation.sortedKeys.links;
    const linkToSwap = sortedLinkKeys[newPos - 1];
    if (linkToSwap) {
      this.currentLocation.contents[linkToSwap].queuePos = record.queuePos;
      record.queuePos = newPos;
    } else {
      const fromIndex = record.queuePos;
      console.log("sliced keys", sortedLinkKeys.slice(fromIndex - 1));
      sortedLinkKeys.slice(fromIndex - 1).forEach((key) => {
        this.currentLocation.contents[key].queuePos -= 1;
      });
      record.queuePos = this.currentLocation.sortedKeys.links.length;
    }
    this.setSortedKeys();
    await this.saveAndRender();
  }
  async setPlaylist(folder) {
    const keys = [];
    let tempVault = folder;
    while (tempVault?.parent) {
      console.log(keys);
      keys.push(folder.title);
      tempVault = folder.parent;
    }
    await chrome.storage.local.set({
      playlist: {
        keys: keys.reverse(),
        links: this.currentLocation.sortedKeys.links.map((linkKey) => folder.contents[linkKey]),
        queuePos: this.currentLocation.queueStart
      }
    });
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, "startPlaylist");
    });
  }
}

// src/index.ts
var vaultTest;
(async () => {
  const vaultMan = new VaultManager((await chrome.storage.local.get("vault")).vault || {
    contents: {},
    title: "Home",
    queueStart: 1,
    sortedKeys: {
      folders: [],
      links: []
    }
  });
  vaultTest = vaultMan;
  console.log("vault from index.js", vaultMan.vault);
  document.body.appendChild(getTag("h1", { textContent: "LINK MANAGER", className: "p-4 text-center text-2xl font-bold text-blue-500" }));
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs.filter((tab) => tab.lastAccessed).sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
    document.body.append(getTag("div", { className: "px-4 flex flex-col gap-2 w-[360px]" }, [
      getTag("form", { className: "flex gap-2 m-0" }, [
        getTag("button", {
          className: "p-2 border-2 border-blue-600 rounded-xl",
          textContent: "\u2B06\uFE0E",
          onclick: (e) => {
            e.preventDefault();
            console.log("go to parent dir");
            console.log(vaultMan.currentLocation);
            if (vaultMan.currentLocation.parent) {
              vaultMan.currentLocation = vaultMan.currentLocation.parent;
              vaultMan.render();
            }
          }
        }),
        getTag("input", {
          className: "w-full p-2 rounded-xl border-2 border-blue-600",
          value: currentTab.title,
          required: true,
          id: "title"
        }),
        getTag("button", {
          className: "p-2 rounded-xl border-2 border-blue-600",
          textContent: "\uFF0B",
          type: "submit",
          onclick: (e) => {
            e.preventDefault();
            console.log("add link");
            const title = document.querySelector("#title")?.value;
            const { url } = currentTab;
            if (title && url)
              vaultMan.addLink({ title, url });
          }
        }),
        getTag("button", {
          className: "p-2 rounded-xl border-2 border-blue-600",
          textContent: "\uD83D\uDCC1",
          type: "submit",
          onclick: (e) => {
            e.preventDefault();
            console.log("add folder");
            const title = document.querySelector("#title").value;
            vaultMan.addFolder({ title });
          }
        })
      ]),
      getTag("div", { className: "flex flex-wrap justify-around items-center p-2 border-2 border-gray-300 rounded-xl" }, [
        getTag("h1", { id: "folderTitle", className: "text-center text-lg font-bold" }),
        getTag("div", { id: "queueController" })
      ]),
      getTag("div", { id: "directoryContainer", className: "flex flex-col gap-2 bg-gray-200 p-2 rounded-xl" })
    ]));
    vaultMan.render();
  });
})();
