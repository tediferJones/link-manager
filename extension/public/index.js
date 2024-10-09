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

// src/components/renderLink.ts
function renderLink({ idTest, folder, key }, vaultMan) {
  return getTag("div", {}, [
    getTag("div", { className: "flex justify-between items-center" }, [
      getTag("a", {
        id: `title-${idTest}`,
        className: "p-2 underline text-blue-600 truncate",
        textContent: key,
        href: folder.contents[key],
        target: "_blank",
        rel: "noopener noreferrer"
      }),
      getTag("button", {
        id: `settings-${idTest}`,
        textContent: "\u2630",
        className: "w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl",
        onclick: () => {
          const container = document.querySelector(`#edit-${idTest}`);
          if (!container)
            throw Error("cant find edit container");
          container.classList.toggle("p-2");
          document.querySelector(`#title-${idTest}`)?.classList.toggle("rounded-b-none");
          if (container.hasChildNodes())
            return clearChildren(`edit-${idTest}`);
          container.append(getTag("button", {
            textContent: "Delete",
            className: "bg-red-500 flex-1 rounded-xl",
            onclick: () => {
              vaultMan.deleteItem(folder, key);
            }
          }), getTag("button", {
            textContent: "Rename",
            className: "bg-green-500 flex-1 rounded-xl",
            onclick: () => {
              const title = document.querySelector(`#title-${idTest}`);
              if (!title)
                throw Error("cant find title element");
              title.replaceWith(getTag("input", {
                id: `rename-${idTest}`,
                className: "p-2 border-2 border-blue-600 rounded-xl",
                value: key
              }));
              const renameInput = document.querySelector(`#rename-${idTest}`);
              if (!renameInput)
                throw Error("cant find rename element");
              renameInput.addEventListener("blur", () => {
                console.log("trigger blur event");
                const newKey = document.querySelector(`#rename-${idTest}`).value;
                if (newKey && newKey !== key) {
                  folder.contents[newKey] = folder.contents[key];
                  delete folder.contents[key];
                }
                vaultMan.save();
                vaultMan.render();
              });
              renameInput.focus();
            }
          }));
        }
      })
    ]),
    getTag("div", { id: `edit-${idTest}`, className: "flex gap-2 bg-gray-300 rounded-xl rounded-t-none" })
  ]);
}

// src/components/renderLockedFolder.ts
function renderLockedFolder({ idTest, folder, key }, vaultMan) {
  return getTag("div", {}, [
    getTag("div", { id: `header-${idTest}`, className: "flex justify-between items-center gap-2" }, [
      getTag("div", {
        id: `title-${idTest}`,
        textContent: `${key}`,
        className: "flex-1 rounded-xl p-2 folder"
      }),
      getTag("button", {
        textContent: "\uD83D\uDD12",
        className: "border-2 border-orange-600 rounded-xl p-2",
        onclick: () => {
          const dropdown = clearChildren(`edit-${idTest}`);
          dropdown.classList.toggle("p-2");
          dropdown.append(getTag("form", {
            className: "w-full m-0 flex gap-2",
            onsubmit: async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const password = form.elements.namedItem(`decrypt-${idTest}`).value;
              vaultMan.decryptFolder(folder, key, password);
            }
          }, [
            getTag("input", {
              id: `decrypt-${idTest}`,
              type: "text",
              placeholder: "Password",
              required: true,
              className: "p-2 rounded-xl"
            }),
            getTag("button", {
              textContent: "Decrypt",
              type: "submit",
              className: "p-2 rounded-xl bg-orange-600"
            })
          ]));
          document.querySelector(`#decrypt-${idTest}`).focus();
        }
      })
    ]),
    getTag("div", { id: `edit-${idTest}`, className: "flex gap-2 bg-gray-300 rounded-xl rounded-t-none" })
  ]);
}

// src/components/renderFolder.ts
function renderFolder({ idTest, folder, key, newPrefix, hidden }, vaultMan) {
  return getTag("div", {}, [
    getTag("div", { id: `header-${idTest}`, className: "flex justify-between items-center gap-2" }, [
      getTag("div", {}, [
        getTag("div", {
          id: `title-${idTest}`,
          textContent: `${key} (${Object.keys(folder.contents[key].contents).length})`,
          className: "flex-1 rounded-xl p-2 folder",
          onclick: (e) => {
            vaultMan.folder = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
            const target = e.target;
            target.classList.toggle("bg-blue-600");
            target.classList.toggle("text-white");
            const dirContents = document.querySelector(`#${idTest}`);
            const settingsContainer = document.querySelector(`#edit-${idTest}`);
            if (!settingsContainer)
              throw Error("Cant find edit container");
            if (dirContents) {
              dirContents.classList.toggle("border-l-2");
              if (hidden) {
                dirContents.append(...vaultMan.getVaultList(folder.contents[key], newPrefix, idTest));
                document.querySelector(`#header-${idTest}`)?.append(getTag("button", {
                  id: `settings-${idTest}`,
                  textContent: "\u2630",
                  className: "w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl",
                  onclick: () => {
                    settingsContainer.classList.toggle("p-2");
                    target.classList.toggle("rounded-b-none");
                    if (settingsContainer.hasChildNodes())
                      return clearChildren(`edit-${idTest}`);
                    settingsContainer.append(getTag("button", {
                      textContent: "Delete",
                      className: "bg-red-500 flex-1 rounded-xl",
                      onclick: () => {
                        vaultMan.deleteItem(folder, key);
                      }
                    }), getTag("button", {
                      textContent: "Rename",
                      className: "bg-green-500 flex-1 rounded-xl",
                      onclick: () => {
                        const title = document.querySelector(`#title-${idTest}`);
                        if (!title)
                          throw Error("cant find title element");
                        title.replaceWith(getTag("input", {
                          id: `rename-${idTest}`,
                          className: "p-2 border-2 border-blue-600 rounded-xl",
                          value: key
                        }));
                        const renameInput = document.querySelector(`#rename-${idTest}`);
                        if (!renameInput)
                          throw Error("cant find rename element");
                        renameInput.addEventListener("blur", () => {
                          console.log("trigger blur event");
                          const newKey = document.querySelector(`#rename-${idTest}`).value;
                          if (newKey && newKey !== key) {
                            folder.contents[newKey] = folder.contents[key];
                            delete folder.contents[key];
                          }
                          vaultMan.save();
                          vaultMan.render();
                        });
                        renameInput.focus();
                      }
                    }), getTag("button", {
                      textContent: "Lock",
                      className: "bg-orange-500 flex-1 rounded-xl",
                      onclick: async () => {
                        const dropdownContainer = clearChildren(`edit-${idTest}`);
                        dropdownContainer.append(getTag("form", {
                          className: "m-0 flex gap-2",
                          onsubmit: async (e2) => {
                            e2.preventDefault();
                            const form = e2.currentTarget;
                            const password = form.elements.namedItem("password").value;
                            vaultMan.encryptFolder(folder.contents[key], password);
                            vaultMan.save();
                            vaultMan.render();
                          }
                        }, [
                          getTag("input", {
                            id: `encrypt-${idTest}`,
                            name: "password",
                            type: "password",
                            required: true,
                            placeholder: "Password",
                            className: "p-2 border-2 border-blue-600 rounded-xl"
                          }),
                          getTag("button", {
                            type: "submit",
                            textContent: "Encrypt",
                            className: "p-2 rounded-xl bg-blue-600 text-white"
                          })
                        ]));
                      }
                    }));
                    setTimeout(() => {
                      document.querySelector(`#encrypt-${idTest}`).focus();
                    }, 2000);
                  }
                }));
              } else {
                while (dirContents.firstChild)
                  dirContents.removeChild(dirContents.firstChild);
                document.querySelector(`#settings-${idTest}`)?.remove();
              }
              hidden = !hidden;
            }
          }
        })
      ])
    ]),
    getTag("div", { id: `edit-${idTest}`, className: "flex gap-2 bg-gray-300 rounded-xl rounded-tl-none" }),
    getTag("div", { id: idTest, className: "m-2 mr-0 border-blue-600 folderContents" })
  ]);
}

// src/lib/VaultManager.ts
class VaultManager {
  vault;
  folder;
  constructor(vault) {
    this.vault = vault;
    this.folder = [];
  }
  async save() {
    window.localStorage.setItem("vault", JSON.stringify(await this.reduceVault()));
  }
  render() {
    clearChildren("directoryContainer").append(...this.getVaultList());
  }
  getCurrentFolder() {
    return this.folder.reduce((currentLoc, key) => currentLoc = currentLoc.contents[key], this.vault);
  }
  addLink({ title, url }) {
    this.getCurrentFolder().contents[title] = { url, viewed: false };
    this.save();
    this.render();
  }
  addFolder({ title }) {
    this.getCurrentFolder().contents[title] = { contents: {} };
    this.save();
    this.render();
  }
  deleteItem(folder, key) {
    delete folder.contents[key];
    this.save();
    this.render();
  }
  async encryptFolder(folder, password) {
    const salt = getRandBase64("salt");
    const iv = getRandBase64("iv");
    const fullKey = await getFullKey(password, salt);
    const folderData = folder.contents;
    const encrypted = await encrypt(JSON.stringify(folderData), fullKey, iv);
    console.log("raw content", JSON.stringify(folderData));
    console.log("encrypted", encrypted);
    console.log("password", password);
    folder.locked = {
      data: encrypted,
      iv,
      salt,
      fullKey
    };
    this.save();
    this.render();
  }
  async decryptFolder(folder, key, password) {
    const { data, iv, salt } = folder.contents[key].locked;
    const fullKey = await getFullKey(password, salt);
    const decrypted = await decrypt(data, fullKey, iv);
    console.log("decrypted data", decrypted);
    folder.contents[key].contents = JSON.parse(decrypted);
    folder.contents[key].locked.fullKey = fullKey;
    this.render();
  }
  async reduceVault(vault = this.vault) {
    return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault = await newVaultPromise;
      if (vault.contents[key].contents) {
        const result = await this.reduceVault(vault.contents[key]);
        const locked = vault.contents[key].locked;
        if (locked) {
          if (locked?.fullKey) {
            locked.data = await encrypt(JSON.stringify(result.contents), locked.fullKey, locked.iv);
          }
          newVault.contents[key] = { locked };
        } else {
          newVault.contents[key] = { contents: result.contents };
        }
      } else {
        newVault.contents[key] = vault.contents[key];
      }
      return newVault;
    }, Promise.resolve({ contents: {} }));
  }
  getVaultList(folder = this.vault, prefix = [], id = "id") {
    return Object.keys(folder.contents).sort().map((key, i) => {
      const props = {
        idTest: id + `-${i}`,
        newPrefix: prefix.concat(key),
        hidden: true,
        folder,
        key
      };
      return folder.contents[key].url ? renderLink(props, this) : folder.contents[key].contents ? renderFolder(props, this) : renderLockedFolder(props, this);
    });
  }
}

// src/index.ts
var vault = window.localStorage.getItem("vault") ? JSON.parse(window.localStorage.getItem("vault")) : { contents: {} };
var vaultMan = new VaultManager(vault);
document.body.appendChild(getTag("h1", { textContent: "LINK MANAGER", className: "p-4 text-center text-2xl font-bold text-blue-500" }));
chrome.tabs.query({ active: true }, (tabs) => {
  const currentTab = tabs.filter((tab) => tab.lastAccessed).sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
  document.body.append(getTag("div", { className: "p-4" }, [
    getTag("form", { className: "flex gap-2" }, [
      getTag("input", {
        className: "p-2 border-2 border-blue-600 rounded-xl",
        value: currentTab.title,
        required: true,
        id: "title",
        onsubmit: (e) => {
          e.preventDefault();
          console.log("submitted");
        }
      }),
      getTag("button", {
        className: "p-2 rounded-xl border-2 border-blue-600",
        textContent: "\uFF0B",
        type: "submit",
        onclick: (e) => {
          e.preventDefault();
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
          const title = document.querySelector("#title").value;
          vaultMan.addFolder({ title });
        }
      })
    ]),
    getTag("div", { id: "directoryContainer", className: "flex flex-col gap-2 py-2" }, Object.keys(vault.contents).length ? vaultMan.getVaultList() : [getTag("div", {
      textContent: "No vault found",
      className: "p-4 text-center text-xl font-bold text-gray-500"
    })])
  ]));
});
