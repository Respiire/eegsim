## EEGSIM: Multi-Channel EEG simulator

An open hardware, open-source easy-to-use EEG simulator for testing &
validating EEG amplifiers and performing hardware-in-the-loop EEG simulations

![wfsa-award](media/wfsa-award.svg)

EEGSIM is part of a suite of devices developed with support from the
World Federation of Societies of Anesthesiologists (WFSA) Fresenius Kabi
Innovation Award.

[eegsim_board](media/eegsim.png)

## Features & Specifications

1. Signal Generation
- 2 channel EEG, REF and GND connections
- Simplex noise generator for sleep/anesthesia simulation
- Test tones for EEG amplifier test
- +/-100uV calibrated amplitude range
2. Open Hardware Interface
- Arduino-based firmware on Seeediuno XIAO ARM M0 SAMD21
- Simple printed circuit board design intended for diy builds
- USB powered
3. Open Source Software Interface
- USB Web Serial control - use directly in your browser w/o installation
- Progressive Web App Interface

## Block diagram

[eegsim_blockdiagram](media/eegsim-blockdiagram.png)

## Comparison Table

| | Netech MiniSim | EEGSIM |
| -- | -- | -- |
| Channels | 5 | 2 |
| Power | 9V Battery | USB C |
| Interface | LCD | Web App |
| EEG Tone |  Yes  | Yes |
| EEG Simplex | No  | Yes |
| EEG ABR |  Yes | No |
| Frequencies | 0.1,0.5,2,50,60 Hz | 1-40 Hz |
| Cost | ~$700 | ~$20 |

## Software

The EEGSIM is controlled by a progressive web application via the USB
Web Serial interface that is supported by Chromium based browsers on all
platforms except iOS. The application can be found here:

[EEGSIM Software Interface](https://eegsim.respiire.com)

The source code for the EEGSIM application is located in the `software/` folder.
The compiled web application is located in the `webapp/` folder.

## Hardware

Schematics and circuit board are located in the `hardware/` folder. The
board is designed to be easy to hand solder with minimal tools, using 0805
SMD components or larger. A soldering iron, tweezer and heat gun should
be all that you need to get started building the board.

The EEGSIM consists of two boards, a generic digitial io board and the
EEGSIM board. The two boards sandwich together to form the complete system
that can be controlled via USB Web Serial from a phone, tablet or desktop
computer.

### Components

| Ref | Description | Footprint/spec |
| --- | ----------- | ------------- |
| H1,H2 | Female header | 7 pos 0.1" / 2.54mm |
| R5,R6 | 25M resistor | 1/8W 5% 0805 |
| R1,R2,R3,R4 | 1.5K resistor  | 1/8W 5% 0805 |

Please note that this repository only contains the EEGSIM board that
interfaces to the EEG electrodes, not the digital io board that interfaces to
a computer. You will need to build the digital board as well to complete the
device. This design is located [here](https://github.com/respiire/digital).

## Firmware

The EEGSIM digital board contains a Seeeduino XIAO with an ARM M0 SAMD21
controller programmed via the Arduino toolchain. The firmware is located
in the `firmware/` folder. To use this code you'll need to install the
Arduino toolchain, the Seeeduino XIAO libraries and the TinyUSB stack
version 0.10.5 (no later version).

## Free & Open Source

[open_source](media/open-source.svg)

EEGSIM is free for all to use under the liberal MIT license.

## Important Notes

- Some EEG monitors for anesthesia do not use conventional snap-on
stickers but a custom integrated sticker montage that is either unilateral
or bilateral. Please reach out to us if you are interested in direct
interfacing to such stickers.

## Disclaimers

1. This device is not a medical device nor is it intended for medical
diagnosis and the design is provided to you "as is". Respiire Health
Systems Inc. makes no express or implied warranties whatsoever with
respect to its functionality, operability, or use, including, without
limitation, any implied warranties, fitness for a particular purpose,
or infringement. We expressly disclaim any liability whatsoever for any
direct, indirect, consequential, incidental or special damages, including,
without limitation, lost revenues, lost profits, losses resulting from
business interruption or loss of data, regardless of the form of action
or legal theory under which the liability may be asserted, even if advised
of the possibility of such damages.

2. This device is intended for use for engineering development, demonstration,
or evaluation purposes only and is not considered by Respiire Health Systems
Inc. to be a finished end-product fit for general consumer use. Persons
handling the device must have electronics and biomedical training and
observe good engineering practice standards. 

3. This device is a prototyping board and not intended to be complete
in terms of required design-, marketing-, and/or manufacturing-related
protective considerations, including product safety and environmental
measures typically found in commercial end products that incorporate such
semiconductor components or circuit boards. As such, it does not fall
within the scope of the European Union directives regarding electromagnetic
compatibility, restricted substances (RoHS), recycling (WEEE), FCC, CE
or UL, and therefore may not meet the technical requirements of these
directives or other related directives.

