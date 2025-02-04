---
title: HelloUEFI
order: 1
---

# HelloUEFI

运行环境: 零刻5800H、联想拯救者y7000(2020) \
构建环境: archlinux

---

UEFI一般只支持FAT文件系统和PE格式的.EFI文件

操作步骤如下: 
1. 安装`mingw-gcc`用于交叉编译出PE格式文件:
   `sudo pacman -S mingw-w64-gcc`
2. 编写uefi应用程序:
   ```c:no-line-numbers
   struct EFI_SYSTEM_TABLE {
       char _buf[60];
       struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL {
           unsigned long long _buf;
           unsigned long long (*OutputString)(
               struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This,
               unsigned short *String);
           unsigned long long _buf2[4];
           unsigned long long (*ClearScreen)(
               struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This);
       } *ConOut;
   };
     
   void efi_main(void *ImageHandle __attribute__ ((unused)),
       struct EFI_SYSTEM_TABLE *SystemTable)
   {
       SystemTable->ConOut->ClearScreen(SystemTable->ConOut);
       SystemTable->ConOut->OutputString(SystemTable->ConOut, L"Hello UEFI!\n");
       while (1);
   }
   ```
3. 编译:
   ```shell
   x86_64-w64-mingw32-gcc -Wall -Wextra -e efi_main -nostdinc -nostdlib \
      -fno-builtin -Wl,--subsystem,10 -o main.efi main.c
   ```
   说明：
   - `-W`: 是gcc的一个通用前缀, 用于设置警告(Warning)相关选项以及链接器、汇编器等相关选项, 如:
      - `-Wall`: 启用所有常见的编译器警告
      - `-Wextra`: 启用额外的警告
      - `-Werror`: 将所有警告视为错误
      - `-Wl`: 将后面的参数传递给链接器`ld`, \
        例如`-Wl,--subsystem,10`就会把`--subsystem,10`作为参数传递给链接器`ld`,\
        其相当于`--subsystem=10`, 其中第10号子系统是`EFI Application`, 11号子系统是`EFI Boot Service Driver`, 12号子系统是`EFI Runtime Driver`.
      - `-Wa`: 将后面的参数传递给汇编器`as`
   - `-f`: 同样是`GCC`的一个通用选项前缀, 用于控制编译器的功能(Function)或行为, 如:
      - `-fno-builtin`: 禁用编译器内置函数的优化 \
        UEFI开发中, 通常需要禁用内置函数优化(如memcpy、memset等常用函数的内联优化), 以确保代码行为符合预期.
      - `-fPIC`: 生成位置无关代码(Position Independent Code), 使代码不依赖于固定内存地址
   - `-e`: 指定程序入口(Entrance)函数
   - `-nostdinc`: 禁止编译器搜索标准头文件目录. 也就是说编译器在处理`#include`指令时不会搜索通常位于系统目录(如 /usr/include)中的标准头文件
   - `-nostdlib`: 禁止链接标准C库.
4. 格式化U盘(fdisk):
   ```shell:no-line-numbers
   $ lsblk                             # 查看blk设备

   $ sudo fdisk /dev/sdb               # 以检测到位于sdb的U盘为例
   Command (m for help): o             # 创建新的DOS分区表
   
   Command (m for help): n             # 建立新的分区
   Partition type
     p   primary (0 primary, 0 extended, 4 free)
     e   extended (container for logical partitions)
   Select (default p): p
   Partition number (1-4, default 1): 1
   First sector (2048-15228927, default 2048): [default]
   Last sector, +sectors or +size{K,M,G,T,P} (2048-15228927, default 15228927): [default]
   
   Command (m for help): t             # 将分区类型标识符修改为 b(W95 FAT32) 表示该分区是 FAT32 文件系统
   Selected partition 1
   Hex code (type L to list all codes): b
   If you have created or modified any DOS 6.x partitions, please see the fdisk documentation for additional information.
   Changed type of partition 'Linux' to 'W95 FAT32'.
   
   Command (m for help): w             # 保存分区表
   The partition table has been altered.
   
   $ sudo mkfs.vfat -F 32 /dev/sdb1    # 格式化分区为 FAT32
   ```
5. 将编译好的文件"main.efi"移动至U盘的"/EFI/BOOT/"目录下, 修改文件名为"BOOTX64.EFI".
6. 重启电脑, 在选择启动盘界面可以看到对应`UEFI: ...`的选项, 进入成功显示"Hello UEFI!".


