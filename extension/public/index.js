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

// src/index.ts
var clearChildren = function(id) {
  const parent = document.querySelector(`#${id}`);
  if (!parent)
    throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild)
    parent.removeChild(parent.firstChild);
  return parent;
};
var updateRender = function() {
  window.localStorage.setItem("vault", JSON.stringify(vault));
  const dir = clearChildren("directoryContainer");
  dir.append(...getVaultList(vault));
};
var getCurrentFolder = function() {
  return folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key], vault);
};
var generateSettingsDropDown = function(target, container, id, folder, key) {
  console.log("target", target, "container", container);
  return getTag("button", {
    id: `settings-${id}`,
    textContent: "\u2630",
    className: "w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl",
    onclick: () => {
      container.classList.toggle("p-2");
      target.classList.toggle("rounded-b-none");
      if (container.hasChildNodes())
        return clearChildren(`edit-${id}`);
      container.append(getTag("button", {
        textContent: "Delete",
        className: "bg-red-500 flex-1 rounded-xl",
        onclick: () => {
          delete folder[key];
          updateRender();
        }
      }), getTag("button", {
        textContent: "Rename",
        className: "bg-green-500 flex-1 rounded-xl",
        onclick: () => {
          const title = document.querySelector(`#title-${id}`);
          if (!title)
            throw Error("cant find title element");
          title.replaceWith(getTag("input", {
            id: `rename-${id}`,
            className: "p-2 border-2 border-blue-600 rounded-xl",
            value: key
          }));
          const renameInput = document.querySelector(`#rename-${id}`);
          if (!renameInput)
            throw Error("cant find rename element");
          renameInput.addEventListener("blur", () => {
            console.log("trigger blur event");
            const newKey = document.querySelector(`#rename-${id}`).value;
            if (newKey && newKey !== key) {
              folder[newKey] = folder[key];
              delete folder[key];
            }
            updateRender();
          });
          renameInput.focus();
        }
      }), getTag("button", {
        textContent: "Lock",
        className: "bg-orange-500 flex-1 rounded-xl",
        onclick: async () => {
          const dropdownContainer = clearChildren(`edit-${id}`);
          dropdownContainer.append(getTag("form", {
            className: "m-0 flex gap-2",
            onsubmit: async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const password = form.elements.namedItem("password").value;
              const salt = getRandBase64("salt");
              const iv = getRandBase64("iv");
              const encrypted = await encrypt(JSON.stringify(folder[key]), await getFullKey(password, salt), iv);
              console.log("encrypted", encrypted);
              const decrypted = await decrypt(encrypted, await getFullKey(password, salt), iv);
              console.log("decrypted", decrypted, JSON.parse(decrypted));
            }
          }, [
            getTag("input", {
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
    }
  });
};
var getVaultList = function(folder, prefix = [], id = "id") {
  return Object.keys(folder).sort().map((key, i) => {
    const idTest = id + `-${i}`;
    const newPrefix = prefix.concat(key);
    let hidden = true;
    return typeof folder[key] === "string" ? getTag("div", {}, [
      getTag("div", { className: "flex justify-between items-center" }, [
        getTag("a", {
          id: `title-${idTest}`,
          className: "p-2 underline text-blue-600 truncate",
          textContent: key,
          href: folder[key],
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
                delete folder[key];
                updateRender();
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
                    folder[newKey] = folder[key];
                    delete folder[key];
                  }
                  updateRender();
                });
                renameInput.focus();
              }
            }));
          }
        })
      ]),
      getTag("div", { id: `edit-${idTest}`, className: "flex gap-2 bg-gray-300 rounded-xl rounded-t-none" })
    ]) : getTag("div", {}, [
      getTag("div", { id: `header-${idTest}`, className: "flex justify-between items-center gap-2" }, [
        getTag("div", {}, [
          getTag("div", {
            id: `title-${idTest}`,
            textContent: `${key} (${Object.keys(folder[key]).length})`,
            className: "flex-1 rounded-xl p-2 folder",
            onclick: (e) => {
              folderLoc = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
              console.log(folderLoc);
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
                  dirContents.append(...getVaultList(folder[key], newPrefix, idTest));
                  document.querySelector(`#header-${idTest}`)?.append(generateSettingsDropDown(target, settingsContainer, idTest, folder, key));
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
  });
};
document.body.appendChild(getTag("h1", { textContent: "LINK MANAGER", className: "p-4 text-center text-2xl font-bold text-blue-500" }));
var vault = window.localStorage.getItem("vault") ? JSON.parse(window.localStorage.getItem("vault")) : {};
var folderLoc = [];
chrome.tabs.query({ active: true }, (tabs) => {
  const currentTab = tabs.filter((tab) => tab.lastAccessed).sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
  document.body.append(getTag("div", { className: "p-4" }, [
    getTag("form", { className: "flex gap-2" }, [
      getTag("input", {
        className: "p-2 border-2 border-blue-600 rounded-xl",
        value: currentTab.title,
        required: true,
        id: "title"
      }),
      getTag("button", {
        className: "p-2 rounded-xl border-2 border-blue-600",
        textContent: "\uFF0B",
        type: "submit",
        onclick: (e) => {
          const title = document.querySelector("#title").value;
          if (title && currentTab.url)
            getCurrentFolder()[title] = currentTab.url;
          updateRender();
        }
      }),
      getTag("button", {
        className: "p-2 rounded-xl border-2 border-blue-600",
        textContent: "\uD83D\uDCC1",
        type: "submit",
        onclick: (e) => {
          const title = document.querySelector("#title").value;
          if (title)
            getCurrentFolder()[title] = {};
          updateRender();
        }
      })
    ]),
    getTag("div", { id: "directoryContainer", className: "flex flex-col gap-2 py-2" }, Object.keys(vault).length ? getVaultList(vault) : [getTag("div", {
      textContent: "No vault found",
      className: "p-4 text-center text-xl font-bold text-gray-500"
    })])
  ]));
});
