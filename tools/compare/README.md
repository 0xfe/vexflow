# Compare Images

First, open index.html in your local browser.

When we refer to "current" images, we mean the test output from your current branch.

We want to compare the current images to "reference" images from an earlier revision (usually the most recent npm release).

There are two ways to generate images to compare.

# Method 1: Single Working Copy

First, check out a known good revision. Then build that revision and move the output to the `vexflow/reference/` directory.

```
grunt reference
```

Then, check out your current branch and build it.

```
git checkout my-new-feature-branch
grunt
```

Now we need to generate images for both the reference and the current branch.

```
grunt generate:current
grunt generate:reference
```

Open the `vexflow/build/images/` directory and you'll see two folders: `current/` and `reference/`.

You can drag this `images/` folder onto the compare page. It will load the images from the two folders and allow you to compare them.

# Method 2: Two Working Copies

Sometimes, you may have two local working copies of VexFlow (e.g., your own, and someone else's fork). This can happen when someone has submitted a pull request, and you want to compare their output to yours.

You can treat each separate working copy as a "current" build, and run `grunt` and `grunt generate:current` on each.

Now, you will have two `vexflow/build/images/current/` folders.

You can drag these two folders onto the compare tool's page (one to the left side, and the other to the right side). Essentially, you treat one `current/` folder as the "reference" and the other `current/` folder as the "current".

If you find it cumbersome to have two `current/` folders, you could rename one of them to `reference/` and then move it over to the other working copy's `vexflow/build/images/` directory. Then, proceed as if you only had a single working copy, by dragging the `images/` folder onto the compare tool's page.
