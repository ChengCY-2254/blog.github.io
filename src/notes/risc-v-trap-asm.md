---
tags:
  - RISC-V
  - asm
updateTime: 2025-10-31 14:20:31
outline: deep
title: RISC-V trap出入口笔记
---
# RISC-V trap出入口笔记

```rust
#[repr(C)]
pub struct TrapContext {
    /// general regs[0..31]
    pub x: [usize; 32],
    /// CSR sstatus      
    pub sstatus: Sstatus,
    /// CSR sepc
    pub sepc: usize,
}
```

## trap入口

```asm
0000000080200010 <__alltraps>:
// 交换用户栈和内核栈的寄存器位置，这里的sp是用户栈指针，执行后变成了内核栈指针，原本的用户栈现在存放到了sscratch寄存器中
80200010: 73 11 01 14  	csrrw	sp, sscratch, sp
// 分配一个陷阱帧 大小为0x100 0x110=272
80200014: 6d 71        	addi	sp, sp, -0x110
// 下面的sd指令都是在保存CPU当前的寄存器状态，将状态保存到刚刚分配的陷阱帧里
80200016: 06 e4        	sd	ra, 0x8(sp)  //保存返回地址寄存器
80200018: 0e ec        	sd	gp, 0x18(sp) //保存全局指针gp
8020001a: 16 f4        	sd	t0, 0x28(sp) //临时寄存器t0-t6
8020001c: 1a f8        	sd	t1, 0x30(sp) //保存寄存器s0-s11
8020001e: 1e fc        	sd	t2, 0x38(sp) //参数/返回值寄存器 a0-a7
80200020: a2 e0        	sd	s0, 0x40(sp)
80200022: a6 e4        	sd	s1, 0x48(sp)
80200024: aa e8        	sd	a0, 0x50(sp)
80200026: ae ec        	sd	a1, 0x58(sp)
80200028: b2 f0        	sd	a2, 0x60(sp)
8020002a: b6 f4        	sd	a3, 0x68(sp)
8020002c: ba f8        	sd	a4, 0x70(sp)
8020002e: be fc        	sd	a5, 0x78(sp)
80200030: 42 e1        	sd	a6, 0x80(sp)
80200032: 46 e5        	sd	a7, 0x88(sp)
80200034: 4a e9        	sd	s2, 0x90(sp)
80200036: 4e ed        	sd	s3, 0x98(sp)
80200038: 52 f1        	sd	s4, 0xa0(sp)
8020003a: 56 f5        	sd	s5, 0xa8(sp)
8020003c: 5a f9        	sd	s6, 0xb0(sp)
8020003e: 5e fd        	sd	s7, 0xb8(sp)
80200040: e2 e1        	sd	s8, 0xc0(sp)
80200042: e6 e5        	sd	s9, 0xc8(sp)
80200044: ea e9        	sd	s10, 0xd0(sp)
80200046: ee ed        	sd	s11, 0xd8(sp)
80200048: f2 f1        	sd	t3, 0xe0(sp)
8020004a: f6 f5        	sd	t4, 0xe8(sp)
8020004c: fa f9        	sd	t5, 0xf0(sp)
8020004e: fe fd        	sd	t6, 0xf8(sp)
80200050: f3 22 00 10  	csrr	t0, sstatus //读取S状态寄存器到t0
80200054: 73 23 10 14  	csrr	t1, sepc    //读取S异常程序计数器到t1
80200058: 16 e2        	sd	t0, 0x100(sp)   //保存t0到陷阱帧
8020005a: 1a e6        	sd	t1, 0x108(sp)   //保存t1到陷阱帧
8020005c: f3 23 00 14  	csrr	t2, sscratch//将sscratch，也就是用户栈指针读取到t2中
80200060: 1e e8        	sd	t2, 0x10(sp)    //将t2，也就是用户栈指针保存到陷阱帧中
80200062: 0a 85        	mv	a0, sp          //a0寄存器是参数寄存器，将sp赋给a0作为参数传递给接下来的函数
80200064: 97 10 00 00  	auipc	ra, 0x1     //接下来两个指令是跳转到trap_handler去执行陷阱指令
80200068: e7 80 a0 ed  	jalr	-0x126(ra) <trap_handler>
```

## trap出口

```asm
000000008020006c <__restore>:
8020006c: 2a 81        	mv	sp, a0          //返回值一般都在a0中，所以这里将a0的陷阱帧地址放到sp寄存器中，sp现在是内核上下文
8020006e: 92 62        	ld	t0, 0x100(sp)   //将sstatus加载到t0
80200070: 32 63        	ld	t1, 0x108(sp)   //将S异常程序计数器加载到t1
80200072: c2 63        	ld	t2, 0x10(sp)    //将sscratch加载到t2
80200074: 73 90 02 10  	csrw	sstatus, t0 //写入sstatus
80200078: 73 10 13 14  	csrw	sepc, t1    //写入sepc
8020007c: 73 90 03 14  	csrw	sscratch, t2//写入sscratch
80200080: a2 60        	ld	ra, 0x8(sp)     //开始恢复通用寄存器
80200082: e2 61        	ld	gp, 0x18(sp)
80200084: a2 72        	ld	t0, 0x28(sp)
80200086: 42 73        	ld	t1, 0x30(sp)
80200088: e2 73        	ld	t2, 0x38(sp)
8020008a: 06 64        	ld	s0, 0x40(sp)
8020008c: a6 64        	ld	s1, 0x48(sp)
8020008e: 46 65        	ld	a0, 0x50(sp)
80200090: e6 65        	ld	a1, 0x58(sp)
80200092: 06 76        	ld	a2, 0x60(sp)
80200094: a6 76        	ld	a3, 0x68(sp)
80200096: 46 77        	ld	a4, 0x70(sp)
80200098: e6 77        	ld	a5, 0x78(sp)
8020009a: 0a 68        	ld	a6, 0x80(sp)
8020009c: aa 68        	ld	a7, 0x88(sp)
8020009e: 4a 69        	ld	s2, 0x90(sp)
802000a0: ea 69        	ld	s3, 0x98(sp)
802000a2: 0a 7a        	ld	s4, 0xa0(sp)
802000a4: aa 7a        	ld	s5, 0xa8(sp)
802000a6: 4a 7b        	ld	s6, 0xb0(sp)
802000a8: ea 7b        	ld	s7, 0xb8(sp)
802000aa: 0e 6c        	ld	s8, 0xc0(sp)
802000ac: ae 6c        	ld	s9, 0xc8(sp)
802000ae: 4e 6d        	ld	s10, 0xd0(sp)
802000b0: ee 6d        	ld	s11, 0xd8(sp)
802000b2: 0e 7e        	ld	t3, 0xe0(sp)
802000b4: ae 7e        	ld	t4, 0xe8(sp)
802000b6: 4e 7f        	ld	t5, 0xf0(sp)
802000b8: ee 7f        	ld	t6, 0xf8(sp)         //通用寄存器恢复结束
802000ba: 51 61        	addi	sp, sp, 0x110    //给sp加上0x100,详情请见`__alltraps`的第二条指令。用于释放陷阱帧分配的内核空间
802000bc: 73 11 01 14  	csrrw	sp, sscratch, sp //互换sp和sscratch，这里的sp是内核栈指针，sscratch是用户栈指针，命令完成后将会是用户栈为主导
802000c0: 73 00 20 10  	sret                     //跳转到sepc指向的指令恢复执行，并根据sstatus恢复特权级和使能状态
```