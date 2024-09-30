export class BasicEmail {
    private body: string;

    constructor(body: string) {
        this.body = body;
    }

    public getHtml(): string {
        return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Title of the document</title>
      </head>
      <body>${this.body}</body>
    </html>`;
    }
}
