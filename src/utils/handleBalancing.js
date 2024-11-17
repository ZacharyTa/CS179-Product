// logic for handling the A* search algo smth

export default function handleBalancing(manifestText) {
    const newManifestText = manifestText;
    // Note: right now, all this does is return the manifest text without any changes
    // This function will handle balancing the containers in the manifestText
    // The data format of the manifestText is a string:
    // [row, col], {weight}, item
    // ...
    // [01, 02], {00000}, NAN
    // [01, 03], {00000}, NAN
    // [01, 04], {00120}, Ram
    // ....
    
    // --------------------------------------------------
    // TODO: Implement ur search algorithm logic stuff here
    // ur code here
    



    // --------------------------------------------------

    // Return requirements:
    // Data format: Ensure that the newManifestText is the same exactly format as the manifestText:
    // [row, col], {weight}, item
    // ...
    // [01, 02], {00120}, Ram // Switched from NAN to Ram
    // [01, 03], {00000}, NAN
    // [01, 04], {00000}, NAN // Switched from Ram to NAN
    // ....
    return newManifestText;
}