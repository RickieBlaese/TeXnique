import express from "express";
import "node-fetch";

let app = express();

app.get("/pfwiki", async function (req, res) {
    let target = { title: "", latex: "", raw: ""};
    let tex = "";
    let t, preproof;
    do {
        do {
            do {
                do {
                    do {
                        t = await (await fetch("https://proofwiki.org/wiki/Special:RandomRootpage")).text();
                    } while (t.indexOf('id="Proof"') == -1);
                    preproof = t.split('id="Proof"')[0];
                } while (preproof.split("<dl>").length <= 1 || t.split('class="mw-page-title-main">')[1].split("</span>")[0].toLowerCase().indexOf("example") != -1);
            } while (preproof.split("<dl>")[1].split("</dl>")[0].split("<dd>").length <= 1);
        } while (preproof.split("<dl>")[1].split("</dl>")[0].split("<dd>")[1].split("</dd>")[0].indexOf("$") == -1);
        let stex = preproof.split("<dl>")[1].split("</dl>")[0].split("<dd>")[1].split("</dd>")[0];
        target.raw = stex;
        stex = stex.replace(/<.*?>/g, "");
        stex = stex.replace(/\\ds/g, ""); // no displaystyles
        let inmath = stex.startsWith("$");
        stex = stex.replace(/\$$/, "").replace(/^\$/, "");
        stex = stex.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "\\&").replace(/&quot;/g, "\"");
        stex = stex.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
            return String.fromCharCode(charCode);
        });
        if (!inmath) {
            tex += "\\text{";
        }
        for (let ch of stex) {
            if (ch == "$") {
                if (inmath) {
                    tex += "\\text{";
                } else {
                    tex += "}";
                }
                inmath = !inmath;
            } else {
                tex += ch;
            }
        }
        if (!inmath && tex != "") {
            tex += "}";
        }
    } while (tex == "");
    target.latex = tex;
    target.title = t.split('class="mw-page-title-main">')[1].split("</span>")[0];
    res.set("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify(target));
    return 200;
});

app.listen(3000, () => {
    console.log("listenin on 3000");
});
