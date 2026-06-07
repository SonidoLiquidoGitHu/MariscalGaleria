#!/usr/bin/env python3
"""SSH wrapper for git that uses paramiko to proxy the connection."""
import sys
import os
import paramiko

def main():
    key_path = os.path.expanduser('~/.ssh/id_ed25519')
    pkey = paramiko.Ed25519Key.from_private_key_file(key_path)
    
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('github.com', username='git', pkey=pkey, timeout=30)
    
    # Get the git command from arguments
    # git calls: ssh user@host "git-receive-pack 'repo.git'" or similar
    args = sys.argv[1:]
    if args:
        # The last argument is usually the command to execute on remote
        remote_cmd = args[-1]
        host_arg = [a for a in args[:-1] if '@' in a or 'github.com' in a]
        
        # Execute the remote command
        stdin, stdout, stderr = client.exec_command(remote_cmd)
        
        # Proxy data between local git and remote
        import select
        import socket
        
        # For git-push, we need to handle the git protocol properly
        # This is complex - let's use a different approach
        pass
    
    client.close()

if __name__ == '__main__':
    main()
