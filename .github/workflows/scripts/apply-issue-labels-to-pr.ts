const https = require("https");

async function applyLabelFromLinkedIssueToPR(pr, token) {
  const query = `
    query GetLinkedIssues($owner: String!, $repo: String!, $prNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          closingIssuesReferences(first: 10) {
            nodes {
              number
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const graphqlData = JSON.stringify({
    query,
    variables: {
      owner: pr.base.repo.owner.login,
      repo: pr.base.repo.name,
      prNumber: pr.number,
    },
  });

  const requestOptions = {
    hostname: "api.github.com",
    path: "/graphql",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": graphqlData.length,
      "Authorization": "Bearer " + token,
      "User-Agent": "Node.js",
    },
  };

  const linkedIssues: any[] = await new Promise((resolve, reject) => {
    const request = https.request(requestOptions, (response) => {
      let responseBody = "";
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        resolve(
          JSON.parse(responseBody).data.repository.pullRequest
            .closingIssuesReferences.nodes
        );
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.write(graphqlData);
    request.end();
  });

  if (linkedIssues.length === 0) {
    console.log("No issue linked.");
    return;
  }

  for (const issue of linkedIssues) {
    const labels = issue.labels.nodes.map((label) => label.name);

    if (labels.length === 0) {
      console.log(`No labels found on the linked issue #${issue.number}.`);
      continue;
    }

    const requestOptions = {
      hostname: "api.github.com",
      path: `/repos/${pr.base.repo.owner.login}/${pr.base.repo.name}/issues/${pr.number}/labels`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
        "User-Agent": "Node.js",
      },
    };

    const postData = JSON.stringify({
      labels: labels,
    });

    await new Promise<void>((resolve, reject) => {
      const request = https.request(requestOptions, (response) => {
        response.on("data", () => {});
        response.on("end", () => {
          resolve();
        });
      });

      request.on("error", (error) => {
        reject(error);
      });

      request.write(postData);
      request.end();
    });

    console.log(
      `Applied labels: ${labels.join(", ")} to PR#${
        pr.number
      } from linked issue #${issue.number}`
    );
  }
}



(async () => {
  if (!process.env.PR_DATA) {
    console.log("No PR data found.");
    return;
  }

  const prData = JSON.parse(process.env.PR_DATA);
  const token = process.env.GITHUB_TOKEN;

  await applyLabelFromLinkedIssueToPR(prData, token);
})();
