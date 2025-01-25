---
title: dockerImages
order: 5
---

## gitea/gitea

### Run(使用docker-compose)

```shell:yaml
version: "3"
networks:
  gitea:
    external: false
services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    restart: always
    networks:
      - gitea
    environment:
      - DB_TYPE=mysql
      - DB_HOST=db:3306
      - DB_NAME=gitea
      - DB_USER=gitea
      - DB_PASSWD=gitea
    volumes:
      - E:/docker/gitea:/data           # gitea 默认将仓库数据放在 /data 下
    ports:
      - "3002:3000"
      - "2222:22"
    depends_on:
      - db
  db:
    image: mysql:latest
    container_name: mysql
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=root123456
      - MYSQL_USER=gitea                # 快捷创建一个普通用户
      - MYSQL_PASSWORD=gitea
      - MYSQL_DATABASE=gitea
    networks:
      - gitea
    volumes:
      - E:/docker/mysql:/var/lib/mysql # /var/lib/mysql 是数据文件存放位置
```

### Note

1. 外部目录中的配置文件"app.ini"挂载到内部目录: /data/gitea/conf (或者将所有必要文件整体挂载到内部目录: /data) <br /> 
2. network host 选项可以让容器使用宿主机的网络环境, 然后可以 -e GITEA__SERVER__HTTP_PORT=3002 从而用宿主机的端口访问 Gitea.  <br /> 
3. 上传已有仓库
    * 方法1: "app.ini"中要添加以下配置才能在页面中直接迁移本地仓库: <br />
      ```ini:no-line-numbers
      [security]
      IMPORT_LOCAL_PATHS = true
      ```
      同时, 要将仓库在宿主机的目录挂载到内部目录, 之后迁移使用的"本地路径"是内部目录中的仓库路径(注意勾选migrate lfs). \
      (gitea中仓库为裸仓库, 存放在内部目录"/data/gitea/data/gitea-repositories/用户名/仓库名.git") <br />
    * 方法2: 直接在gitea中创建一个新的空仓库, 然后从本地仓库push. lfs大文件也会自动push到内部目录的"/data/gitea/data/lfs". <br /> 
      为避免每次push都要输入用户名密码, 可启用git自动保存用户名密码功能: git config --global credential.helper store <br /> 
4. <strong>注意app.ini中`DOMAIN`和`ROOT_URL`等要写局域网地址/外网地址, 不然局域网/外网不能用git访问. </strong><br /> 
5. <strong>远程缺失lfs文件可以使用`git lfs push --all origin`强制将本地仓库中的lfs文件推送到远程仓库. </strong><br /> 
6. 在app.ini中通过以下修改允许上传头像的最大大小: 
    ```ini:no-line-numbers
    [picture]
    AVATAR_MAX_FILE_SIZE = 10485760 # 10MB
    ```