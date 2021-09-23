
import { NodeHtmlMarkdown } from "node-html-markdown";
// import moment from "moment";
// import fs from "fs";

export default (html) => {
    /* Converte HTML para MarkDown */
    let md = NodeHtmlMarkdown.translate(html);

    /* Remove cabeçalhos de e-mail */
    md = md
        .replace(/\\\-{2,}\sForwarded message\s\-{2,}/g, "")
        .replace(/^(De|From|Date|Subject|Assunto|Cc|Cco|To|Para)\:.+/gim, "");

    /* Retira espaços desnecessários */
    md = md
        .trim()
        .split(/\r?\n/)
        .map((val) => val.trim());

    /* Remove espaços e quebras de linha duplicados */
    md = md
        .join("\n")
        .replace(/(>\n){2,}/g, ">\n")
        .replace(/\s+/, " ")
        .replace(/\n{2,}/g, "\n\n");

    /* Remove a assinatura do Gmail */
    md = md.substring(0, /\\\-\-\r?\n/g.exec(md).index).trim();

    // let date = moment().format("YYY-MM-DD_HH-mm-ss.x");
    // fs.writeFileSync(`debug/${date}.md`, md);

    return md;
}