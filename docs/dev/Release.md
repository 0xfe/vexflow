# Release

We release to npm and GitHub with the help of the [release-it](https://www.npmjs.com/package/release-it) tool.

If you are a maintainer of VexFlow, you will need access to:

- GitHub personal access token. Create one here: https://github.com/settings/tokens/new?scopes=repo&description=release-it.
- Your favorite authenticator app for generating a one time password (OTP) for npm: More info on 2FA here: https://docs.npmjs.com/configuring-two-factor-authentication.

Are you ready to release a new version of VexFlow?

We assume you have tested the library thoroughly.

To release, follow these steps:

- Build the library for production:

```
  grunt
```

- Run the release script. Remember to use your GitHub [personal access token ](https://github.com/settings/tokens/new?scopes=repo&description=release-it) that you generated earlier:

```
GITHUB_TOKEN=ghp_j3ksAiw9pPkdeXaMplEt0k3nkQaW  npm run release
```

- The first prompt will ask you to select the new version number. Choose `patch` if you are fixing a bug and want to bump the version number by the smallest amount.

- Press `<ENTER>` to answer Yes to the prompts about committing, tagging, and pushing.

- You're all done!

* The release workflow will look something like this:

```
🚀 Let's release vexflow (currently at 4.0.4)

? Select increment (next version): patch (4.0.5)
✔ echo add build/ folder
✔ git add -f build/
✔ git commit -m 'Add build/ for the release.'

? Publish vexflow to npm? Yes
? Please enter OTP for npm: __YOUR_ONE_TIME_PASSWORD__
? Commit (release vexflow version 4.0.5)? Yes
? Tag (4.0.5)? Yes
? Push? Yes
? Create a release on GitHub (Release 4.0.5)? Yes
✔ echo Successfully released vexflow v4.0.5 to 0xfe/vexflow.
✔ echo remove build/ folder
✔ git rm -r build/
✔ git commit -m 'Remove build/ after the release.'
🔗 https://www.npmjs.com/package/vexflow
🔗 https://github.com/ronyeh/vexflow/releases/tag/4.0.5
🏁 Done (in 33s.)

```

# Manual Release to NPM

xxx

# Manual Release to GitHub

xxx
