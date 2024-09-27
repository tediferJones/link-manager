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
document.body.appendChild(getTag("h1", { textContent: "LINK MANAGER", className: "p-4 text-center text-2xl font-bold text-blue-500" }));
var vault = window.localStorage.getItem("vault");
chrome.tabs.query({ active: true }, (tabs) => {
  const currentTab = tabs.filter((tab) => tab.lastAccessed).sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
  document.body.append(getTag("div", { className: "p-4" }, [
    getTag("div", { className: "flex gap-4" }, [
      getTag("p", { textContent: currentTab.title, className: "text-nowrap m-auto" }),
      getTag("button", {
        className: "p-4 rounded-xl border-2 border-blue-600",
        textContent: "Add",
        onclick: (e) => {
        }
      })
    ]),
    vault ? getTag("div", { textContent: "You have a vault" }) : getTag("div", {
      textContent: "No vault found",
      className: "p-4 text-center text-xl font-bold text-gray-500"
    })
  ]));
});
