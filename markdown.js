import { NodeHtmlMarkdown } from "node-html-markdown";
import { default as d } from "debug";

export default (html) => {
    const debug = d("markdown");

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

    /* Localiza a assinatura do Gmail */
    const r = /\\\-\-\r?\n/g.exec(md);
    debug();

    /* Remove a assinatura do Gmail */
    md = md.substring(0).trim();

    // let date = moment().format("YYY-MM-DD_HH-mm-ss.x");
    // fs.writeFileSync(`debug/${date}.md`, md);

    return md;
};
