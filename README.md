# EnglewoodSocialServices
Visualizing Social Services in Englewood

To Deploy: 

Prereq: git, Node.js&npm, sudo

git clone https://github.com/uic-evl/EnglewoodSocialServices.git
cd EnglewoodSocialServices
npm install
sudo su
(as root:)
npm install -g pm2
pm2 startup
(to run on port 80, you need sudo, also, do NOT use watch & reload)
pm2 start server.js -- -p 80
pm2 save
exit