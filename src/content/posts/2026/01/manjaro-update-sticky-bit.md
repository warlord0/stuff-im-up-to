---
pubDatetime: 2026-01-19T19:14:30+00:00
title: "Manjaro Update – Sticky Bit"
tags:
  - "Linux"
  - "Manjaro"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Fixing the Sticky Bit Error with Polkit in Manjaro If you’re using Manjaro Linux and have encountered an authentication dialog that gets stuck, displaying an error about the file /usr/lib/polkit-1/polkit-agent-helper-1, you’re not alone. This issue can impede your ability to perform updates, install software, or even manage system settings. Here’s how to troubleshoot and resolve…"
---
## Fixing the Sticky Bit Error with Polkit in Manjaro

If you’re using Manjaro Linux and have encountered an authentication dialog that gets stuck, displaying an error about the file `/usr/lib/polkit-1/polkit-agent-helper-1`, you’re not alone. This issue can impede your ability to perform updates, install software, or even manage system settings. Here’s how to troubleshoot and resolve this sticky bit error effectively.

### Understanding the Problem

The error message typically reads something like this:

> “Authorization requires authentication. The polkit agent failed to respond.\
> /usr/lib/polkit-1/polkit-agent-helper-1 must be owned by root and have the sticky bit set.”

This warning means that the `polkit-agent-helper-1` file is either not owned by the root user or doesn’t have the appropriate sticky bit permission, which is essential for security purposes and effective user authentication.

### The Challenge

Unfortunately, the problem becomes frustrating due to a limitation in the GUI environment: the authentication dialog is non-responsive, preventing you from accessing a terminal or switching to any other applications where you could resolve the issue.

### Step-by-Step Solution

Here’s a reliable method to fix the sticky bit error, allowing you to regain control over your Manjaro system.

#### Step 1: Access a Non-GUI Terminal

1.  **Switch to a TTY Session**:

- Press **Ctrl + Alt + F2** (or F3, F4, etc., depending on your system). This will take you to a command-line interface (TTY) outside of the graphical user interface.

#### Step 2: Log In

2.  **Enter Your Credentials**:

- Type your username and password to log in to the system.

#### Step 3: Fix the Ownership and Sticky Bit

3.  **Execute the Correct Command**:

- Now that you’re in the terminal, type the following command to ensure the `polkit-agent-helper-1` file is owned by root and has the appropriate sticky bit set:\
  `bash sudo chmod 4755 /usr/lib/polkit-1/polkit-agent-helper-1`
- This command changes the permissions, setting the sticky bit on the file, which is crucial for its operation.

#### Step 4: Return to the GUI Environment

4.  **Go Back to Your Desktop**:

- After successfully executing the command, return to your graphical environment by pressing **Ctrl + Alt + F1** (or the function key that corresponds to your GUI).

### Conclusion

Once you’ve completed these steps, the sticky bit error should be resolved, and you should be able to access the necessary applications once again. This method proves invaluable when facing GUI limitations, as it allows for effective troubleshooting directly from a command-line interface.
