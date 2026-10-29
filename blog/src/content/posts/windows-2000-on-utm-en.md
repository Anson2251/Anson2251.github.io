---
title: "Reviving Windows 2000 on a Mac: A UTM Tinkering Log"
published: 2026-10-29
description: "To run SolidWorks 2000, I fought through an endless OOBE loop, dual cores, 1440×900, and FTP — then slimmed the whole thing back down."
tags: ["Windows 2000", "QEMU", "UTM"]
category: "Retrocomputing"
lang: en
translationKey: "windows-2000-on-utm"
draft: true
---

I'd meant to get SolidWorks back onto this Mac for a long time, and kept putting it off. The new version won't even start under Wine, so I dug through archive.org until I found the SolidWorks 2000 installers — and then discovered that its setup wizard wraps a 16-bit program. Wine on macOS hasn't been able to run 16-bit code since the day Apple dropped 32-bit support, so that road was closed. The only option left was a virtual machine.

I already had UTM installed; I'd run Manjaro on ARM in it, and Windows 95 too. If 95 could go in, 2000 should be less trouble. Old systems don't take much space, either: I gave the virtual disk 32 GB, and after SP4, IE6, and SolidWorks, the C: drive was only using 2.14 GB. This Mac's drive has never had much room to spare. There was also a more practical reason: the features I actually need were settled a quarter-century ago. Anything added to Windows or SolidWorks after 2000, I have no use for.

## Building a Machine from 1996

The first thing UTM asks when you create a VM is Emulate or Virtualize. Virtualize goes through Apple's virtualization framework — fast, but it only runs systems of the same architecture. This is an M3 Mac, so running x86 Windows meant choosing Emulate and letting QEMU translate one instruction at a time. Architecture: i386. Machine type: the default pc, which in QEMU is the 1996 pairing of i440FX and PIIX.

Two defaults had to change for the install. USB got turned off outright: before SP4, Windows 2000 has no EHCI driver, so a USB 2.0 controller just shows up in Device Manager as an unknown device with an exclamation mark. I never used a USB device at any point in this process, and once it was off I never turned it back on. Input devices had to be forced onto PS/2. UTM defaults to a USB keyboard and USB tablet, which the SP0 installer doesn't recognize — halfway through setup the mouse just stops responding. I learned both of these the hard way installing 95; they're the standard opening remarks for any old system.

The installation itself has nothing worth reporting: copy files, reboot, reach the GUI, enter a username and serial number, set up networking.

![The first screen of setup: 640×480, 16 colors, a diagonally striped background and a purple title bar](../../assets/posts/windows-2000-on-utm/win2000-setup.png)

The problem came after the final step: the machine rebooted and the setup wizard appeared again, identical to the first boot. Eject the disc and reboot — still there. Eject again, reboot again — still there.

That phase has an official name today: OOBE. In 2000 it had no name; it was just the last few screens of setup. I still don't fully understand what causes the loop, but I did stumble onto a recipe that gets the system past it: add `-global ide-device.win2k-install-hack=on` to QEMU, switch the CPU to qemu32, drop to one core, and change the video card to cirrus. All three together, and it went obediently to the desktop. After the install, set the CPU back to pentium3, the video card to VGA, and remove that flag, exactly as its name says.

Later I looked in the [QEMU manual](https://www.qemu.org/docs/master/system/qemu-manpage.html) and found that the two names are the same thing. Under `-win2k-hack` it says this is a synonym for `-global ide-device.win2k-install-hack=on`, used to work around a Windows 2000 disk-full bug during installation, and that it should be removed afterward because it slows down IDE transfers. The comment in the source is more specific: on every 16th PIO write, QEMU delays the interrupt by 1 ms instead of raising it immediately, because when the write interrupt arrives too early, the Windows 2000 setup IDE driver floods the disk with empty log entries.

In other words, the flag's whole job is to yield a little on timing, and the price is slower IDE transfers.

Ruben Schade wrote a post in 2022 about [running Windows 2000 on an M1](https://www.rubenerd.au/windows-2000-in-qemu-on-an-m1-mac/); his recipe was `-cpu qemu32,level=1`, and he hit a KMODE_EXCEPTION_NOT_HANDLED blue screen; he explicitly notes that `-win2k-hack` did nothing for him. In UTM's [discussion #6967](https://github.com/utmapp/UTM/discussions/6967), the conclusion is `pentium-v1` plus the global hack, and the poster says you can delete the flag once the install is done. [Discussion #6142](https://github.com/utmapp/UTM/discussions/6142) in the same repo describes symptoms identical to mine — enter the CD key, set up networking, and it starts over — and a reply says this is a setup race, again offering `qemu32,level=1`. When I tried pentium myself, the machine didn't blue-screen; it hung. And qemu32 without level=1 still completed the install.

Four accounts, four different shapes of failure. Put side by side, the one shared variable nobody wrote down is the QEMU version: Ruben's post is from 2022, when it was 7.x; someone in the UTM discussions used `pc-i440fx-10.0`, a machine name from 10.x.

So I'm not going to pin down a cause here. What's certain is that it's a race: there's no single correct configuration; each recipe just nudges the timing to a spot its own environment happens not to fall into. I'll file my own under the same heading — I don't know why pentium hangs, only that qemu32 gets through on this machine. I'm noting the UTM version too, because if someone digs this up in three years, this post will probably read as one more recipe that deserves suspicion.

## A Disc That Only Goes One Way

Once the system was installed, the next problem was getting things into it. UTM's directory sharing is no use to Windows 2000 — neither virtiofs nor SPICE's WebDAV has a client that 2k can run — so I fell back on the most primitive method: pack the files into an ISO on the Mac and mount it in the virtual optical drive. The first thing to go in that way was the SolidWorks 2000 disc set.

The installer was in Chinese too. The welcome page announced, "Congratulations on choosing this Windows® original 3D product design software, recognized by the industry as the standard," with a row of 1998–1999 award badges underneath and an InstallShield progress bar crawling along in the bottom right. I installed PhotoWorks and Acrobat Reader 4.0 along the way.

![The SolidWorks 2000 installer welcome screen](../../assets/posts/windows-2000-on-utm/solidworks-welcome.png)

Afterward there were a few new icons on the desktop, and double-clicking them opened the apps. The system was still SP0, just as it came from the factory — no SP4, no IE6 — and it installed and ran all the same.

At that point I thought I was done. But an ISO is read-only: things can go in, but they can't come out, and the parts I'd drawn were stuck inside.

## Making It Look Less Like 1999

SP4 and IE6 came first, both packed into ISOs and mounted the same way. The service pack has a trap: the language has to match. This machine runs Chinese Windows 2000, so SP4 had to be the Chinese package; the wrong one is rejected outright by the installer. IE6 doesn't care — its installer won't refuse over language. Before the upgrade the browser was IE 5.0.2800.1106, and any URL you typed gave you "The page cannot be displayed."

![IE 5.0.2800.1106, the browser before IE6 was installed](../../assets/posts/windows-2000-on-utm/ie5.png)

The core count had to change too. Windows 2000 installed with the single-processor HAL; to switch to the multiprocessor one you have to change the driver: in Device Manager, find "Computer," update the driver, and pick ACPI Multiprocessor PC from the list. Always take a snapshot before this step. Switch to the wrong HAL and the system simply won't boot, and 2k has essentially no repair options — you roll back or you're done.

The video card needed its own treatment. Cirrus offers only a handful of modes; 1440×900 is out of the question. The move is to switch the VM's video card from cirrus to vga, boot in, install the Universal VBE Video Display Driver, and then update the driver to `vbempg\VBE30\W2K\PNP`. The idea is to make 2k draw through VESA BIOS extensions — slow, but it reaches 1440×900, and I could finally stop squinting at the text.

![Display properties: the screen area reads 1440 × 900, the adapter is VBE Miniport](../../assets/posts/windows-2000-on-utm/desktop.png)

I tried turning on SPICE in UTM and it didn't work; it left an unusable simple PCI controller in Device Manager, permanently wearing a yellow exclamation mark. Disable it — it serves no purpose.

## SMB Is a Dead End, So: FTP

To get the parts out, the first thought was a shared folder: turn on sharing in Windows 2000 and connect from Finder. The most natural path — and a dead end. 2k speaks SMB1; SMB2 didn't arrive until after Vista, and macOS scrubbed its SMB1 client out long ago. The old trick of editing `/etc/nsmb.conf` to re-enable SMB1 no longer works on current macOS.

So change protocols. Install IIS from Windows Components and select the FTP service — that component needs the install disc, and the files are all on it. Then point the FTP site at the shared folder on the desktop, run `ipconfig` in cmd to check the address, and connect from Finder with `ftp://`. It worked. Finder could read but not write, so I added Cyberduck and then writes worked properly. I gave permissions to Everyone; this machine isn't on the public internet, and there's no point picking a fight with myself.

![IIS 5.0's default FTP site, running the moment it's installed](../../assets/posts/windows-2000-on-utm/iis-ftp.png)

The first thing pulled out was SolidWorks' own official PDF tutorial, 4.7 MB, which opened on the Mac straight away. That made up for the ISO's one-way door, more or less. The folder got messier from there: .SLDPRT parts, exported .STL and .DXF files, plus sdelete.exe for later. Anything that needed to move went through it.

![192.168.64.15 in Cyberduck: parts, tutorials, and tools all piled into one directory](../../assets/posts/windows-2000-on-utm/cyberduck.png)

The trouble was networking. For FTP, the NIC was set to Shared mode so the host could reach directly into the VM at 192.168.64.15 — the subnet macOS uses for shared networking. But Windows 2000 couldn't get online through that NIC; the browser wouldn't open a single page. I didn't dig into why. Adding a second NIC was easier: set the new one to Emulated VLAN, which runs on QEMU's own user-mode networking — traffic can go out, but the host can't get in. Both NICs sit in 2k at once: one for FTP, one for the internet, each doing its job.

With internet access working, the first order of business was certificates. The root certs bundled with 2k are twenty-odd years old, and almost every HTTPS site throws an error. There's a GitHub repo dedicated to collecting certificate updates for these old systems:

::card{url="https://github.com/JohnTHaller/RootCertificateUpdatesForLegacyWindows" site="GitHub" title="RootCertificateUpdatesForLegacyWindows" desc="Root and intermediate certificate updates for versions of Windows that no longer receive them."}

`WindowsRoot.sst` goes into Trusted Root Certification Authorities, `WindowsIntermediate.sst` into Intermediate Certification Authorities, and the two `.pfx` files are the same certificates packaged another way. Afterward, a few more sites did connect — but don't expect miracles: Windows 2000 tops out at TLS 1.0 with cipher suites from that era, so most modern sites reject it during the handshake. Still better than nothing.

## Touching Things I Shouldn't Have

After switching to two cores, boot would sometimes hang. Not a blue screen — just stuck in one place, and a reboot got it in. I put back the flag I'd removed, this time by its short name `-win2k-hack`, and it never hung again. Why? I don't know. It's the same switch as during the install; maybe the boot path has a similar timing race that the 1 ms concession happens to dodge.

Then the disk. The old IDE driver's speed is genuinely ugly, and the internet says you can swap in UniATA (Universal ATA), a third-party ATA driver that understands AHCI and SATA. My plan was to move the optical drive from IDE to SATA, then change the driver. This step went badly: after switching back to the original driver, the optical drive stopped working entirely.

The reason was resources.

The Primary IDE Channel in 2k leaves little room for PnP: its three resources are hardwired — I/O `01F0-01F7`, `03F6-03F6`, and IRQ 14. These aren't negotiated at boot; they're the fixed assignment of the 82371SB in legacy mode. So on every boot the channel has to claim all three exactly as they are; miss one and the whole thing fails to start.

![A yellow exclamation mark on the Primary IDE Channel, and the optical drive is gone](../../assets/posts/windows-2000-on-utm/cd-driver.png)

![All three resources marked unavailable on the Resources tab, and the conflicting-device list spells it out](../../assets/posts/windows-2000-on-utm/irq14.png)

When the optical drive had a stint on SATA and came back, two things happened. The channel was changed to a state with no devices, but its device instances stayed behind in the registry, along with their claims on those resources. And when the driver was switched back, Windows restored only the driver files and registry entries — it didn't run a full device enumeration again. The old CD-ROM instance still hung under the Primary IDE Channel, its parent device in a failed state, and the new instance couldn't take over.

So the thing holding those three resources was an instance that no longer existed. In the normal view you can't see it; Device Manager only shows hardware that's currently present. The fix is to make it visible: set the environment variable `DEVMGR_SHOW_NONPRESENT_DEVICES=1`, open Device Manager again, check Show hidden devices, and the ghost drive appears. Delete it, reboot, and the resources are released.

There's a line here you must not cross: don't delete the optical drive directly in the VM settings. `atapi.sys` loads during boot, its device object hangs off the Primary IDE Channel, and if the channel fails to initialize, the storage stack crashes on the boot path — hello 0x7B. Safe mode won't save you either, because safe mode loads the same stack. In the end I never did use uniata. The payoff wasn't worth the risk.

![0x0000007B, INACCESSIBLE_BOOT_DEVICE. Hit it once and you remember](../../assets/posts/windows-2000-on-utm/bsod-0x7b.png)

## Slimming It Back Down

One reason to choose an old system is that it takes up little space — but qcow2 only grows, never shrinks. This machine was using only 2.14 GB, and the image had already grown to 4.5 GB.

The process is three steps. First, defragment C: in 2k so the used data packs together and the freed space is ideally contiguous. Then use [sdelete](https://learn.microsoft.com/en-us/sysinternals/downloads/sdelete) to write zeros over all the free space: `sdelete -z c:`. Watch the version: SDelete 1.61 is the last release that runs on Windows 2000; 2.x and up require XP or newer, and downloading the latest will get you a missing-system-call error.

![A 32 GB virtual disk: with everything installed, only 2.14 GB is in use, and the remaining 93% is empty](../../assets/posts/windows-2000-on-utm/defrag.png)

A big disk with little on it — but qcow2 only records which clusters have been written, not which clusters still hold anything useful.

After the zeros are written, shut down — not suspend — make sure UTM has fully quit, and run this on the Mac:

```sh
qemu-img convert -O qcow2 input.qcow2 output.qcow2
```

When `qemu-img convert` reads the source image it skips all-zero regions, so the destination file doesn't allocate space for those clusters and the file size drops accordingly. What shrinks is the file size; the virtual disk's capacity doesn't change, and the system still reports the original number.

4.5 GB in, 1.5 GB out. A bit smaller than the 2.14 GB the system reports, because NTFS counts the space files occupy, and those files already contain long runs of zeros that convert skipped along with everything else.

One cost you should know about up front: convert exports only the current layer, so every snapshot in the qcow2 is lost. That's how the snapshot I'd kept for the dual-core switch disappeared. The order should be merge the snapshots, then convert — or just copy the original file as a backup.

---

This VM is still in use. I'm learning SolidWorks on it.

![The first part in SolidWorks 2000; the feature tree on the left lists planes, bosses, cuts, and a dozen fillets](../../assets/posts/windows-2000-on-utm/solidworks-part.png)

It's smoother to use than I expected. The layout is straight out of 1999, and the toolbars are dense, but every button does what it says without requiring you to learn it first. The only problem is screen tearing: horizontal bands appear when you drag the model. VBEMP draws straight into video memory with no vertical sync, and QEMU grabs frames whenever it gets around to it. There's essentially no fix short of replacing the whole display stack, and SPICE won't start on this machine.

Later I opened CPU-Z to see what it thought the CPU was. QEMU was given `-cpu pentium3`; CPUID answers family 6 model 7 stepping 3, and CPU-Z looks it up in its table and calls it an Intel Pentium III Xeon 333 MHz — codename Tanner, 0.25 micron, Slot 1. The cache fields read 2 MB L2 and 16 MB L3; those are values QEMU filled in.

![CPU-Z identifies the machine as a 333 MHz Pentium III Xeon — even the cache numbers are made up](../../assets/posts/windows-2000-on-utm/cpuz-info.png)

The benchmark is more telling. The AMD K6-2 CXT 500 is the fastest reference this vintage build offers, and there is nothing above it: CPU score 14927 versus 856, FPU score 20640 versus 3194, seventeen times and six times. A real 333 MHz chip couldn't produce that gap.

![The Bench tab of CPU-Z 1.04, with the fastest reference it offers, an AMD K6-2 CXT 500](../../assets/posts/windows-2000-on-utm/cpuz-benchmark.png)

To Windows this is a 333 MHz Pentium III Xeon; the thing actually executing instructions is an M3, with a layer of translation in between. That ten-odd-fold margin in the benchmark is the M3's doing, and has nothing to do with 1999.

Installing the system was the easy part. Getting it to 1440×900, getting files over from the Mac, stopping the occasional hang at boot — those took far longer than the install itself. Software from twenty-odd years ago really does hold up; the trouble is that the layer it depends on is gone. Drivers have to be swapped, ghost devices deleted, and timing has to yield. Install it again next time, and these recipes will probably have to be rediscovered from scratch.

## Appendix

Final configuration:

| Item | Value |
|---|---|
| Architecture / machine type | i386 / pc (i440FX + PIIX, 1996) |
| CPU | pentium3, 2 cores |
| Memory | 1024 MB |
| Video card | VGA, 64 MB VRAM |
| Disk | qcow2, IDE |
| Optical drive | IDE, read-only |
| NIC | ne2k_pci (Emulated VLAN) + rtl8139 (Shared) |
| Sound card | sb16 |
| Extra arguments | `-win2k-hack` |
| Other | PS/2 controller on, UEFI off, RTC in local time; USB never used |

Temporary configuration during installation: a single-core qemu32 CPU, cirrus video, and `-global ide-device.win2k-install-hack=on`.

Symptom cheat sheet:

| Symptom | Fix |
|---|---|
| Setup loops back to OOBE after reboot | single-core qemu32 + cirrus + install hack |
| Occasional hang at boot after enabling dual cores | add `-win2k-hack` |
| Optical drive reports insufficient resources or stops working | set `DEVMGR_SHOW_NONPRESENT_DEVICES=1`, then delete the ghost device |
| Can't raise the resolution | switch cirrus to vga, install VBEMP |
| Finder can only read from FTP | use Cyberduck |
| Shared NIC can't reach the internet | add an Emulated VLAN NIC |
| qcow2 keeps growing | defrag + `sdelete -z` + `qemu-img convert` |
