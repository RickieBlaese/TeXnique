import express from "express";
import "node-fetch";

let app = express();

app.get("/pfwiki", async function (req, res) {
    let target = { title: "", latex: "" };
    let tex = "";
    let t, preproof;
    do {
        do {
            t = await (await fetch("https://proofwiki.org/wiki/Special:Random")).text();
            preproof = t.split('id="Proof"')[0];
        } while (preproof.split("<dl>").length <= 1);
        let stex = preproof.split("<dl>")[1].split("</dl>")[0].split("<dd>")[1].split("</dd>")[0];
        stex = stex.replace(/<.*?>/g, "");
        stex = stex.replace(/\$$/, "").replace(/^\$/, "");
        stex = stex.replace(/(&#(\d+);)/g, function(match, capture, charCode) {
            return String.fromCharCode(charCode);
        });
        let inmath = true;
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
    target.title = t.split('class="firstHeading">')[1].split("</h1>")[0];
    res.set("Access-Control-Allow-Origin", "*");
    res.send(JSON.stringify(target));
    return 200;
});

app.listen(3000, () => {
    console.log("listenin on 3000");
});
