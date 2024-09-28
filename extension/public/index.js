// src/lib/getTag.ts
function getTag(type, props, children) {
  const node = document.createElement(type);
  if (props)
    Object.keys(props).forEach((propKey) => node[propKey] = props[propKey]);
  if (children?.length)
    node.append(...children.filter((child) => child !== undefined));
  return node;
}

// src/index.ts
var getVaultList = function(folder, prefix = []) {
  return Object.keys(folder).map((key) => {
    const newPrefix = prefix.concat(key);
    const idTest = newPrefix.join("-").replaceAll(" ", "_");
    let hidden = true;
    return typeof folder[key] === "string" ? getTag("div", { className: "flex justify-between items-center" }, [
      getTag("a", {
        className: "p-2 underline text-blue-600 truncate",
        textContent: key,
        href: folder[key],
        target: "_blank",
        rel: "noopener noreferrer"
      }),
      getTag("button", {
        className: "bg-red-500 p-2 rounded-xl",
        textContent: "Delete",
        onclick: (e) => {
          console.log("Trigger delete of record", folder, key);
          delete folder[key];
          window.localStorage.setItem("vault", JSON.stringify(vault));
        }
      })
    ]) : getTag("div", {}, [
      getTag("div", {
        textContent: `${key} (${Object.keys(folder[key]).length})`,
        className: "rounded-xl p-2",
        onclick: (e) => {
          folderLoc = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
          console.log(folderLoc);
          const target = e.target;
          target.classList.toggle("bg-blue-600");
          target.classList.toggle("text-white");
          const childContainer = document.querySelector(`#${idTest}`);
          if (childContainer) {
            childContainer.classList.toggle("border-l-2");
            if (hidden) {
              childContainer.append(...getVaultList(folder[key], newPrefix));
            } else {
              while (childContainer.firstChild)
                childContainer.removeChild(childContainer.firstChild);
            }
            hidden = !hidden;
          }
        }
      }),
      getTag("div", { id: idTest, className: "m-2 mr-0 border-black" })
    ]);
  });
};
document.body.appendChild(getTag("h1", { textContent: "LINK MANAGER", className: "p-4 text-center text-2xl font-bold text-blue-500" }));
var vault = window.localStorage.getItem("vault") ? JSON.parse(window.localStorage.getItem("vault")) : {};
var folderLoc = [];
chrome.tabs.query({ active: true }, (tabs) => {
  const currentTab = tabs.filter((tab) => tab.lastAccessed).sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
  document.body.append(getTag("div", { className: "p-4" }, [
    getTag("div", { className: "flex gap-2" }, [
      getTag("input", {
        className: "p-2 text-nowrap m-auto border-2 border-blue-600 rounded-xl",
        value: currentTab.title,
        id: "title"
      }),
      getTag("button", {
        className: "p-2 rounded-xl border-2 border-blue-600",
        textContent: "Add",
        onclick: (e) => {
          const title = document.querySelector("#title").value;
          if (title && currentTab.url) {
            const loc = folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key], vault);
            loc[title] = currentTab.url;
          }
          window.localStorage.setItem("vault", JSON.stringify(vault));
        }
      }),
      getTag("button", {
        className: "p-2 rounded-xl border-2 border-blue-600",
        textContent: "\uD83D\uDCC1",
        onclick: (e) => {
          const title = document.querySelector("#title").value;
          if (title) {
            const loc = folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key], vault);
            console.log(folderLoc, loc);
            loc[title] = {};
          }
          window.localStorage.setItem("vault", JSON.stringify(vault));
        }
      })
    ]),
    Object.keys(vault).length ? getTag("div", { className: "p-4 flex flex-col gap-2" }, getVaultList(vault)) : getTag("div", {
      textContent: "No vault found",
      className: "p-4 text-center text-xl font-bold text-gray-500"
    })
  ]));
});
